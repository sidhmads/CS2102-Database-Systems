# Stuff Sharing Application – SHAREit

This application allows people to borrow or loan
stuff that they own based on a bidding system.

## Introduction

SHAREit is a stuff sharing application that provides users a platform

to borrow/loan items as well as put up their items for loan. Items

are loaned based on a bidding system in which the successful

bidder can either be chosen by the item owner or automatically

selected by the system. The platform also supports creation,

modification and deletion functionalities for administrators.

## Database Design

### Import Database

The database.backup file has been uploaded. Import the file into pgadmin

### User

| Attribute | Domain |
| --- | --- |
| id (primary key) | integer |
| nickname | character varying |
| password | character varying |
| number | integer |
| email | character varying | 
| isadmin | boolean |

### Item

| Attribute | Domain |
| --- | --- |
| item_id (primary key) | integer |
| item_name | character varying |
| description | character varying |
| min_price | integer |
| location | character varying 
| bid_duration | integer |
| lend_duration | integer |
| category | enum(categoryenum: electronics, clothes, books, toys and games, others) |
| user_id | integer |
| date_of_creation | timestamp with time zone |
| not_expired | boolean |
| bid_start_date | timestamp with time zone |
| self_selection | boolean |
| borrowed | boolean |
| picture | text |

### Session

| Attribute | Domain |
| --- | --- |
| sid (primary key) | integer |
| sess | json |
| expire | timestamp without time zone |

### BiddingItem

| Attribute | Domain |
| --- | --- |
| item_id | integer |
| borrower_id | integer |
| price_offered | integer |
| days_requested | integer |
| date_of_bid | timestamp with time zone | 
| bid_item_id | integer |
| seleceted | boolean |
| composite key: (item_id, borrower_id) ||

### Transaction

| Attribute | Domain |
| --- | --- |
| item_id | integer |
| borrower_id | integer |
| start_date | timestamp with time zone |
| end_date | timestamp with time zone |
| earnings | integer | 
| transaction_id | integer |
| composite key: (item_id, borrower_id) ||

