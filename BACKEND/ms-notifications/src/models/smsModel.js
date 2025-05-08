class SmsModel {
  constructor(to, body) {
    this.to = to;
    this.body = body;
  }

  isValid() {
    return Boolean(this.to && this.body);
  }

  toServiceFormat() {
    return {
      to: this.to,
      body: this.body,
    };
  }

  static fromRequest(requestBody) {
    const { to, body } = requestBody;
    return new SmsModel(to, body);
  }
}

module.exports = SmsModel;
