import test data to your mongoDB instance:

    mongoimport -h ds111111.mlab.com:22222 --jsonArray -d messenger -u user -p password -c users --file test-data/users.json
    mongoimport -h ds111111.mlab.com:22222 --jsonArray -d messenger -u user -p password -c chats --file test-data/chats.json
    mongoimport -h ds111111.mlab.com:22222 --jsonArray -d messenger -u user -p password -c messages --file test-data/messages.json