FROM node:9.4.0

COPY ./ /opt/server
WORKDIR /opt/server
#RUN npm install
CMD npm run start

EXPOSE 3001

