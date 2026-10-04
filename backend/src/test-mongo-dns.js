const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS:", dns.getServers());

dns.resolveSrv(
    "_mongodb._tcp.cluster0.z6xomad.mongodb.net",
    (err, records) => {
        if (err) {
            console.error("DNS ERROR:", err);
            return;
        }

        console.log("MongoDB SRV:");
        console.log(records);
    }
);