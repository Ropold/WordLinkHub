FROM --platform=linux/amd64 openjdk:21
LABEL authors="ropold"
EXPOSE 8080
COPY backend/target/wordlinkhub.jar wordlinkhub.jar
ENTRYPOINT ["java", "-jar", "wordlinkhub.jar"]