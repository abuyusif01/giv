# Entry [0]

1. Customer name [_name]
2. Customer post code, street, city, country [optional] [_addr]
3. tel [_tel]
4. email [_email]
5. date [_date]

# Entry [1]

1. proforma invoice number [_inumber]
3. product name, brand, origin [_product]
4. packing size [_size]
5. prices, currency, price_type [cif, fob] [_price]
6. unit/container [_container]
7. no of container [_ncontainer]
8. total cost (currency) [_tcost]
9. total amount [_price * _ncontainer]

# Entry [2]

1. payment [deposit_value]
2. delivery [_delivery]
3. account number
4. bank name
5. bank branch location
6. bank swift code

# random stuff

invoice number incremental
total cost can be calculate = 22.10 * 1337

9897_AbubakarAbubakarYusif_COOKINGOIL_BALDE.pdf
tcost = 29,547.7
deposite = 10000

x1 = tcost/deposite * 10
x2 = deposite
x3 = 100 - x1

x1, x2, x3

# Qoutation

EC2 -> server to host the site => 10.44/month ec2 with 50% usage 46.72 myr monthly
S3 -> backup 0.5myr/GB
CloudFront -> if you guys want to have a domain [this can be free for the first year] after wards its like 20usd =>  100myr yearly
Domain -> for start point 200myr yearly renewal 50myr


## fixes
1. when user enter wrong password, just alert
2. fix address make it possible to be in 2 lines (if the chars somewhat more)
3. let the user chose which bank to enter default usd -> actually extend the current option to let the user do that


## client requirements
1. address details, maybe need a few line 
2. check date of invoice (get date from user machine, instead of using server time)
3. PI number running, is it if different user use same time, will redundant or not? (this will always be different, depends on who come first) [done]
4. bank details option [done?]


BENEFICIARY               : GLOBAL INTELLECT VENTURES SDN BHD
ACCOUNT NUMBER     : 701-1507818 (USD ACCOUNT)
BANK NAME                  : OCBC BANK MALAYSIA BERHAD
BRANCH                        : MENARA OCBC, NO 18, JALAN TUN PERAK, 50050 KUALA LUMPUR
SWIFT CODE                : OCBCMYKLXXX


BENEFICIARY               : GLOBAL INTELLECT VENTURES SDN BHD
ACCOUNT NUMBER     : 701-1507826 (EURO ACCOUNT)
BANK NAME                  : OCBC BANK MALAYSIA BERHAD
BRANCH                        : MENARA OCBC, NO 18, JALAN TUN PERAK, 50050 KUALA LUMPUR	
SWIFT CODE                : OCBCMYKLXXX


BENEFICIARY               : GLOBAL INTELLECT VENTURES SDN BHD
ACCOUNT NUMBER     : 873194813493 (USD ACCOUNT)
BANK NAME                  : STANDARD CHARTERED BANK MALAYSIA BERHAD
BRANCH                        : SCB JALAN IPOH NO.33-35 JALAN IPOH, GF, 51200 KUALA LUMPUR
SWIFT CODE                :     MYKXXXX


BENEFICIARY               : GLOBAL INTELLECT VENTURES SDN BHD
ACCOUNT NUMBER     : 873194813507 (EURO ACCOUNT)
BANK NAME                  : STANDARD CHARTERED BANK MALAYSIA BERHAD
BRANCH                        : SCB JALAN IPOH NO.33-35 JALAN IPOH, GF, 51200 KUALA LUMPUR
SWIFT CODE                : SCBLMYKXXXX