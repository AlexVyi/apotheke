//add this file to .gitignore
"use strict"
require('dotenv').load();

module.exports = {
  mongoDb_DEV:{

    dbURI:process.env.MONGO_DB_URI

  },
  mongoDb_PRODUCTION:{

    dbURI:process.env.MONGO_DB_URI_PRODUCTION

  },
  mongoDb_TEST:{

    dbURI:process.env.MONGO_DB_URI_TEST

  }

}