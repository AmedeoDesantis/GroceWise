export class ServerOverloadedError extends Error {
    constructor(message = "Server momentaneamente occupato") {
        super(message);
        this.name = "ServerOverloadedError";
    }
}

export class QuotaExceededError extends Error {
    constructor(message = "Quota giornaliera chiamate API esaurita") {
        super(message);
        this.name = "QuotaExceededError";
    }
}