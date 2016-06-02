

# pav_test



## Usage

## Deployment Environment
Per 12 Factor App recommendations, this application is configured through environment variables.

An easy way to set these variables for local development is to add a '.env' file in the project's root directory.  

The .env file should have the following content:

```bash
APP_NAME=pav_test
LOGDIR=./
HOST=localhost
PORT=3000

# An endpoint used to authenticate and retrieve a token needed to access APIs
# (In a production deployment, this endpoint will be deployed separately.)
AUTH_PORT=3005

#  persistence service db configuratoin
DB_CONFIG=/database.json

# The shared secret used when generating and validate a token
# Obviously, the below shows a local developer 'secret'
JWT_SHARED_SECRET=base it in the camp

# 'node' environment or mode (test|development|production).
NODE_ENV=test

## To start

	npm start

## To test

	npm test	


## Developing



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

#Nodeclipse is free open-source project that grows with your contributions.
# pavilion

#JIRA OAuth guide
#https://bitbucket.org/atlassian_tutorial/atlassian-oauth-examples

#basecamp OAuth guide
#https://github.com/basecamp/api/blob/master/sections/authentication.md