#!/bin/bash

url=""

case $1 in
    vd)
	url=https://viridian.vd/VDMDI/CT
	;;
    gh)
	url=git@github.com:marlon-erler/ct.git
	;;
esac

git remote set-url origin $url
git remote get-url origin
