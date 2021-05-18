FROM node:12.22.1-buster-slim

RUN mkdir -p /home/app
WORKDIR /home/app

RUN apt-get update
RUN apt-get -y install \
  .gyp \
  python \
  make \
  libtool \
  g++ \
  autoconf \
  automake \
  cmake \
  swig \
  sox \
  tzdata

RUN npm i -g nodemon

COPY package.json package-lock.json ./
RUN npm i
