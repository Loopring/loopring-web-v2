#!/bin/bash

DIR="$( cd "$( dirname "$0"  )" && pwd  )"
echo "DIR:$DIR"

if [ $DEPLOY_HOME ];then
	echo "DEPLOY_HOME = $DEPLOY_HOME"
	cd $DEPLOY_HOME
	git fetch --all && git reset --hard origin/master && git pull
    rm -rf $DEPLOY_HOME/*
	sleep 1
	cp -rf $DIR/build/* $DEPLOY_HOME
	cd $DEPLOY_HOME
	git add .
	git commit -a -m "update webapp"
	git push
	cd $DIR
else
	echo "DEPLOY_HOME IS NOT EXISTS"
fi
