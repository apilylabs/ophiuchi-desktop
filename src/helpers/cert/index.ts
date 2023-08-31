import * as selfsigned from "selfsigned";

export class CertificateHelper {
  constructor() {
    // init
  }

  public async generateCertificate(hostname: string) {
    var attrs = [{ name: "commonName", value: hostname }];
    var pems = selfsigned.generate(attrs, { days: 365 });

    // save to file
    return pems;
  }
}
