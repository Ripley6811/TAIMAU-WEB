/*
Work in progress!

Design for a new database.

Not implemented yet.
*/

DROP DATABASE IF EXISTS test_migrate;
CREATE DATABASE test_migrate;
USE test_migrate; 



CREATE TABLE companies (
    company_name VARCHAR(4) NOT NULL,
    is_supplier BOOLEAN DEFAULT TRUE,
    is_customer BOOLEAN DEFAULT TRUE
);

CREATE TABLE branches (
    branch_name VARCHAR(4) NOT NULL,
    company_name VARCHAR(4) NOT NULL REFERENCES companies(company_name),
    full_name TINYTEXT,
    english_name TINYTEXT,
    tax_id VARCHAR(8),
    phone VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(50),
    address_office TINYTEXT,
    address_shipping TINYTEXT,
    address_billing TINYTEXT,
    branch_note TEXT
);

-- Product information
CREATE TABLE products (
    id SERIAL PRIMARY KEY
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '', 
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id serial PRIMARY KEY
);

CREATE TABLE shipments (
    id serial PRIMARY KEY,
    ship_number VARCHAR(30), -- shipment_no
    ship_date DATE NOT NULL, -- shipmentdate
    ship_note TEXT, -- shipmentnote
    invoice_number VARCHAR(10) REFERENCES invoices(id)
);
