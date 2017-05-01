INSTALLATION & RUNNING:

sudo apt-get install mongodb-org

mongod --smallfiles

npm install

npm start


YOU ALSO HAVE TO FILL API KEYS IN: config/secret.js


IMPORTING DATA FROM AJONEUVODATA: 

head -n NUM_OF_LINES INPUT_FILENAME | cut -f34,37 -d';' |sed -e '/;;/d' -e '/^;/d' -e '/;$/d' | tr ';' ',' > OUTPUT_FILENAME

mongoimport -d DATABASE_NAME -c COLLECTION_NAME --type csv --file FILENAME.csv --headerline

(COLLECTION_NAME is "vehicle")