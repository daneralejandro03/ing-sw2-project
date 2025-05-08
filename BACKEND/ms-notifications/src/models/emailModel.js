class EmailModel {
  constructor(address, subject, plainText) {
    this.address = address;
    this.subject = subject;
    this.plainText = plainText;
  }

  isValid() {
    return Boolean(this.address && this.subject && this.plainText);
  }

  toServiceFormat() {
    return {
      address: this.address,
      subject: this.subject,
      plainText: this.plainText,
    };
  }

  static fromRequest(requestBody) {
    const { address, subject, plainText } = requestBody;
    return new EmailModel(address, subject, plainText);
  }
}

module.exports = EmailModel;
