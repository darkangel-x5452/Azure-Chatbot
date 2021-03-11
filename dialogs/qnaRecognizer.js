// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { QnAMaker } = require("botbuilder-ai");

class QnARecognizer {
  constructor(config) {
    const qnaIsConfigured =
      config && config.knowledgeBaseId && config.endpointKey && config.host;
    const qnaOptions = {};
    if (qnaIsConfigured) {
      this.recognizer = new QnAMaker(config, qnaOptions);
    }
  }

  get isConfigured() {
    return this.recognizer !== undefined;
  }

  async getQnaResults(context) {
    const answers = await this.recognizer.getAnswers(context);
    return answers;
  }
}

module.exports.QnARecognizer = QnARecognizer;
