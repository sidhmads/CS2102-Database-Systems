-- Calculates average suggested lending price of a person given his id
CREATE OR REPLACE FUNCTION averageLendingPrice(uid NUMERIC)
RETURNS NUMERIC AS
$$
DECLARE mycursor SCROLL CURSOR (id NUMERIC)
FOR 
SELECT i.min_price 
FROM public.item i
WHERE i.user_id = id;
price NUMERIC; avgprice NUMERIC; count NUMERIC;
BEGIN
OPEN mycursor(id:= uid);
avgprice:=0; count:=0; price:=0;
LOOP
FETCH mycursor INTO price;
EXIT WHEN NOT FOUND;
avgprice:=avgprice + price;
count:=count+1;
END LOOP;
CLOSE mycursor;
IF count<1 THEN RETURN null;
ELSE RETURN round(avgprice/count,2); END IF;
END; 
$$
LANGUAGE PLPGSQL;

-- Calculates number of successful lent transactions of a person given his id
CREATE OR REPLACE FUNCTION numLentTransactions(uid NUMERIC)
RETURNS NUMERIC AS
$$
DECLARE num NUMERIC;
BEGIN
SELECT count(*) INTO num
FROM public.transaction T NATURAL JOIN public.item I 
WHERE I.user_id = uid;
RETURN num;
END;
$$
LANGUAGE PLPGSQL;

-- Calculates number of successful borrow transactions of a person given his id
CREATE OR REPLACE FUNCTION numBorrowTransactions(uid NUMERIC)
RETURNS NUMERIC AS
$$
DECLARE num NUMERIC;
BEGIN
SELECT count(*) INTO num
FROM public.transaction T
WHERE T.borrower_id = uid;
RETURN num;
END;
$$
LANGUAGE PLPGSQL;

--Test Cases
-- SELECT averageLendingPrice(12);
-- SELECT numTransactions(11);
-- SELECT numBorrowTransactions(8);


-- Triggers
-- Checks if the Price and Num of Days requested by the borrower is valid for the item
-- Non Trivial Integrity constraint
CREATE OR REPLACE FUNCTION checkPriceAndDays()
RETURNS TRIGGER AS 
$$
DECLARE minPrice NUMERIC;
DECLARE maxDays NUMERIC;
BEGIN

SELECT min_price, lend_duration 
INTO minPrice, maxDays
FROM public.item I
WHERE  I.item_id = NEW.item_id;
IF maxDays < NEW.days_requested
THEN 
RAISE NOTICE 'Item requested for too many days';
RETURN NULL;
END IF;
IF minPrice > NEW.price_offered
THEN 
RAISE NOTICE 'Price requested is too low';
RETURN NULL;
END IF;

RETURN NEW;
END; 
$$
LANGUAGE PLPGSQL;

CREATE TRIGGER CheckBiddingPriceAndDays
BEFORE INSERT OR UPDATE
ON public."biddingItem"
FOR EACH ROW
EXECUTE PROCEDURE checkPriceAndDays();