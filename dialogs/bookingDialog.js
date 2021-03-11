// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  TimexProperty,
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const { InputHints, MessageFactory } = require("botbuilder");
const {
  ConfirmPrompt,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const { DateResolverDialog } = require("./dateResolverDialog");

const CONFIRM_PROMPT = "confirmPrompt";
const DATE_RESOLVER_DIALOG = "dateResolverDialog";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class BookingDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "bookingDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.destinationStep.bind(this),
          this.originStep.bind(this),
          this.travelDateStep.bind(this),
          this.confirmStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * If a destination city has not been provided, prompt for one.
   */
  async destinationStep(stepContext) {
    const bookingDetails = stepContext.options;

    if (!bookingDetails.destination) {
      const messageText = "To what city would you like to travel?";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.destination);
  }

  /**
   * If an origin city has not been provided, prompt for one.
   */
  async originStep(stepContext) {
    const bookingDetails = stepContext.options;

    // Capture the response to the previous step's prompt
    bookingDetails.destination = stepContext.result;
    if (!bookingDetails.origin) {
      const messageText = "From what city will you be travelling?";
      const msg = MessageFactory.text(
        messageText,
        "From what city will you be travelling?",
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.origin);
  }

  /**
   * If a travel date has not been provided, prompt for one.
   * This will use the DATE_RESOLVER_DIALOG.
   */
  async travelDateStep(stepContext) {
    const bookingDetails = stepContext.options;

    // Capture the results of the previous step
    bookingDetails.origin = stepContext.result;
    if (
      !bookingDetails.travelDate ||
      this.isAmbiguous(bookingDetails.travelDate)
    ) {
      return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, {
        date: bookingDetails.travelDate,
      });
    }
    return await stepContext.next(bookingDetails.travelDate);
  }

  /**
   * Confirm the information the user has provided.
   */
  async confirmStep(stepContext) {
    const bookingDetails = stepContext.options;

    // Capture the results of the previous step
    bookingDetails.travelDate = stepContext.result;
    const messageText = `Please confirm, I have you traveling to: ${bookingDetails.destination} from: ${bookingDetails.origin} on: ${bookingDetails.travelDate}. Is this correct?`;
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  /**
   * Complete the interaction and end the dialog.
   */
  async finalStep(stepContext) {
    if (stepContext.result === true) {
      const bookingDetails = stepContext.options;
      return await stepContext.endDialog(bookingDetails);
    }
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.BookingDialog = BookingDialog;

// SIG // Begin signature block
// SIG // MIInLgYJKoZIhvcNAQcCoIInHzCCJxsCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 3p1RxyHjJQVGf5lPnqnlLpbfk4ZbT2oViSm7pVlx3Yag
// SIG // ghFpMIIIezCCB2OgAwIBAgITNgAAAToDcJXiAOAuHQAB
// SIG // AAABOjANBgkqhkiG9w0BAQsFADBBMRMwEQYKCZImiZPy
// SIG // LGQBGRYDR0JMMRMwEQYKCZImiZPyLGQBGRYDQU1FMRUw
// SIG // EwYDVQQDEwxBTUUgQ1MgQ0EgMDEwHhcNMjAxMDIxMjAz
// SIG // OTUyWhcNMjEwOTE1MjE0MzAzWjAkMSIwIAYDVQQDExlN
// SIG // aWNyb3NvZnQgQXp1cmUgQ29kZSBTaWduMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAww0vm+Q1Virb
// SIG // vG6R8XQBSsC53uYfKAdk7Ru+ja6TJJUeaL0OQ0/mas7r
// SIG // ArVc18jVD8zJqFJ90XubgriFF4cV8MXc5hdLJusQPhLg
// SIG // LeEZyNSElC1xbte3X7cBAZ6C56rLDATDzKLD/JiCxa81
// SIG // nPB/1b+WVkYOhVJYA1RizyO6DBs6r+R5bkyeLTYhSww8
// SIG // l+1YTlajfaNw3AbuVbMm+6SoT7RHrYl8PMx/dSdnW16E
// SIG // oBZt/mbDINsRjFXOC7zLpWIwwdPU98BMCRP1EG51+a5n
// SIG // QEiujlSumM48jMHYQ3j7j3PQUR7n77+AksF4Frj3C1vt
// SIG // e+NananNgdG2xYwp/+ym/QIDAQABo4IFhzCCBYMwKQYJ
// SIG // KwYBBAGCNxUKBBwwGjAMBgorBgEEAYI3WwEBMAoGCCsG
// SIG // AQUFBwMDMD0GCSsGAQQBgjcVBwQwMC4GJisGAQQBgjcV
// SIG // CIaQ4w2E1bR4hPGLPoWb3RbOnRKBYIPdzWaGlIwyAgFk
// SIG // AgEMMIICdgYIKwYBBQUHAQEEggJoMIICZDBiBggrBgEF
// SIG // BQcwAoZWaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3Br
// SIG // aWluZnJhL0NlcnRzL0JZMlBLSUNTQ0EwMS5BTUUuR0JM
// SIG // X0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYIKwYB
// SIG // BQUHMAKGRmh0dHA6Ly9jcmwxLmFtZS5nYmwvYWlhL0JZ
// SIG // MlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIwQ0El
// SIG // MjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6Ly9j
// SIG // cmwyLmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5BTUUu
// SIG // R0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYI
// SIG // KwYBBQUHMAKGRmh0dHA6Ly9jcmwzLmFtZS5nYmwvYWlh
// SIG // L0JZMlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIw
// SIG // Q0ElMjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6
// SIG // Ly9jcmw0LmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5B
// SIG // TUUuR0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQw
// SIG // ga0GCCsGAQUFBzAChoGgbGRhcDovLy9DTj1BTUUlMjBD
// SIG // UyUyMENBJTIwMDEsQ049QUlBLENOPVB1YmxpYyUyMEtl
// SIG // eSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZp
// SIG // Z3VyYXRpb24sREM9QU1FLERDPUdCTD9jQUNlcnRpZmlj
// SIG // YXRlP2Jhc2U/b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlv
// SIG // bkF1dGhvcml0eTAdBgNVHQ4EFgQURt0qI0Cz/G6KSKbv
// SIG // PoV06oFdzC8wDgYDVR0PAQH/BAQDAgeAMFQGA1UdEQRN
// SIG // MEukSTBHMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFu
// SIG // ZCBPcGVyYXRpb25zIExpbWl0ZWQxFjAUBgNVBAUTDTIz
// SIG // NjE2Nys0NjI1MTcwggHUBgNVHR8EggHLMIIBxzCCAcOg
// SIG // ggG/oIIBu4Y8aHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraWluZnJhL0NSTC9BTUUlMjBDUyUyMENBJTIwMDEu
// SIG // Y3Jshi5odHRwOi8vY3JsMS5hbWUuZ2JsL2NybC9BTUUl
// SIG // MjBDUyUyMENBJTIwMDEuY3Jshi5odHRwOi8vY3JsMi5h
// SIG // bWUuZ2JsL2NybC9BTUUlMjBDUyUyMENBJTIwMDEuY3Js
// SIG // hi5odHRwOi8vY3JsMy5hbWUuZ2JsL2NybC9BTUUlMjBD
// SIG // UyUyMENBJTIwMDEuY3Jshi5odHRwOi8vY3JsNC5hbWUu
// SIG // Z2JsL2NybC9BTUUlMjBDUyUyMENBJTIwMDEuY3JshoG6
// SIG // bGRhcDovLy9DTj1BTUUlMjBDUyUyMENBJTIwMDEsQ049
// SIG // QlkyUEtJQ1NDQTAxLENOPUNEUCxDTj1QdWJsaWMlMjBL
// SIG // ZXklMjBTZXJ2aWNlcyxDTj1TZXJ2aWNlcyxDTj1Db25m
// SIG // aWd1cmF0aW9uLERDPUFNRSxEQz1HQkw/Y2VydGlmaWNh
// SIG // dGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNz
// SIG // PWNSTERpc3RyaWJ1dGlvblBvaW50MB8GA1UdIwQYMBaA
// SIG // FBtmohn8m+ul2oSPGJjpEKTDe5K9MB8GA1UdJQQYMBYG
// SIG // CisGAQQBgjdbAQEGCCsGAQUFBwMDMA0GCSqGSIb3DQEB
// SIG // CwUAA4IBAQCsWJPvhblg3KkMtQkQSNrU7IJMEP7EfBYt
// SIG // Psc4jRefEHW8lKpgOFBrhwYeE9AL9gS6n1jzfH7T2+Na
// SIG // xz+aCQj9XcqWgtIzrlXhK32iofEAxA5aFMTVJK0mWj1d
// SIG // e5LGyL1rlXrShcmVZFOq0vFg5JZe2yD2Fj1Id7zPjtVg
// SIG // 0DRgO/Mm0BL7zs0bEqLTHglGuwEtbdauQ6dk1FZ6o7W1
// SIG // k4NFwej5YS8rsVQs+D6F99QqRfiKsMwNsPNZbcHuMcxD
// SIG // SwtuMlYx5JrZrhRAIIjwEzGiqmTjHmjoZhTHgndL5GG1
// SIG // QPDrawhzf4o+fkF6caIM+cfM54THFCmFFPyUxEGXnd0Z
// SIG // MIII5jCCBs6gAwIBAgITHwAAABS0xR/G8oC+cQAAAAAA
// SIG // FDANBgkqhkiG9w0BAQsFADA8MRMwEQYKCZImiZPyLGQB
// SIG // GRYDR0JMMRMwEQYKCZImiZPyLGQBGRYDQU1FMRAwDgYD
// SIG // VQQDEwdhbWVyb290MB4XDTE2MDkxNTIxMzMwM1oXDTIx
// SIG // MDkxNTIxNDMwM1owQTETMBEGCgmSJomT8ixkARkWA0dC
// SIG // TDETMBEGCgmSJomT8ixkARkWA0FNRTEVMBMGA1UEAxMM
// SIG // QU1FIENTIENBIDAxMIIBIjANBgkqhkiG9w0BAQEFAAOC
// SIG // AQ8AMIIBCgKCAQEA1VeBAtb5+tD3G4C53TfNJNxmYfzh
// SIG // iXKtKQzSGxuav660bTS1VEeDDjSnFhsmnlb6GkPCeYmC
// SIG // JwWgZGs+3oWJ8yad3//VoP99bXG8azzTJmT2PFM1yKxU
// SIG // XUJgi7I9y3C4ll/ATfBwbGGRXD+2PdkdlVpxKWzeNEPV
// SIG // wbCtxWjUhHr6Ecy9R6O23j+2/RSZSgfzYctDzDWhNf0P
// SIG // vGPflm31PSk4+ozca337/Ozu0+naDKg5i/zFHhfSJZkq
// SIG // 5dPPG6C8wDrdiwHh6G5IGrMd2QXnmvEfjtpPqE+G8MeW
// SIG // bszaWxlxEjQJQC6PBwn+8Qt4Vqlc0am3Z3fBw8kzRunO
// SIG // s8Mn/wIDAQABo4IE2jCCBNYwEAYJKwYBBAGCNxUBBAMC
// SIG // AQEwIwYJKwYBBAGCNxUCBBYEFJH8M85CnvaT5uJ9VNcI
// SIG // GLu413FlMB0GA1UdDgQWBBQbZqIZ/JvrpdqEjxiY6RCk
// SIG // w3uSvTCCAQQGA1UdJQSB/DCB+QYHKwYBBQIDBQYIKwYB
// SIG // BQUHAwEGCCsGAQUFBwMCBgorBgEEAYI3FAIBBgkrBgEE
// SIG // AYI3FQYGCisGAQQBgjcKAwwGCSsGAQQBgjcVBgYIKwYB
// SIG // BQUHAwkGCCsGAQUFCAICBgorBgEEAYI3QAEBBgsrBgEE
// SIG // AYI3CgMEAQYKKwYBBAGCNwoDBAYJKwYBBAGCNxUFBgor
// SIG // BgEEAYI3FAICBgorBgEEAYI3FAIDBggrBgEFBQcDAwYK
// SIG // KwYBBAGCN1sBAQYKKwYBBAGCN1sCAQYKKwYBBAGCN1sD
// SIG // AQYKKwYBBAGCN1sFAQYKKwYBBAGCN1sEAQYKKwYBBAGC
// SIG // N1sEAjAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTAL
// SIG // BgNVHQ8EBAMCAYYwEgYDVR0TAQH/BAgwBgEB/wIBADAf
// SIG // BgNVHSMEGDAWgBQpXlFeZK40ueusnA2njHUB0QkLKDCC
// SIG // AWgGA1UdHwSCAV8wggFbMIIBV6CCAVOgggFPhiNodHRw
// SIG // Oi8vY3JsMS5hbWUuZ2JsL2NybC9hbWVyb290LmNybIYx
// SIG // aHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraWluZnJh
// SIG // L2NybC9hbWVyb290LmNybIYjaHR0cDovL2NybDIuYW1l
// SIG // LmdibC9jcmwvYW1lcm9vdC5jcmyGI2h0dHA6Ly9jcmwz
// SIG // LmFtZS5nYmwvY3JsL2FtZXJvb3QuY3JshoGqbGRhcDov
// SIG // Ly9DTj1hbWVyb290LENOPUFNRVJPT1QsQ049Q0RQLENO
// SIG // PVB1YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZp
// SIG // Y2VzLENOPUNvbmZpZ3VyYXRpb24sREM9QU1FLERDPUdC
// SIG // TD9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0P2Jhc2U/
// SIG // b2JqZWN0Q2xhc3M9Y1JMRGlzdHJpYnV0aW9uUG9pbnQw
// SIG // ggGrBggrBgEFBQcBAQSCAZ0wggGZMDcGCCsGAQUFBzAC
// SIG // hitodHRwOi8vY3JsMS5hbWUuZ2JsL2FpYS9BTUVST09U
// SIG // X2FtZXJvb3QuY3J0MEcGCCsGAQUFBzAChjtodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpaW5mcmEvY2VydHMv
// SIG // QU1FUk9PVF9hbWVyb290LmNydDA3BggrBgEFBQcwAoYr
// SIG // aHR0cDovL2NybDIuYW1lLmdibC9haWEvQU1FUk9PVF9h
// SIG // bWVyb290LmNydDA3BggrBgEFBQcwAoYraHR0cDovL2Ny
// SIG // bDMuYW1lLmdibC9haWEvQU1FUk9PVF9hbWVyb290LmNy
// SIG // dDCBogYIKwYBBQUHMAKGgZVsZGFwOi8vL0NOPWFtZXJv
// SIG // b3QsQ049QUlBLENOPVB1YmxpYyUyMEtleSUyMFNlcnZp
// SIG // Y2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24s
// SIG // REM9QU1FLERDPUdCTD9jQUNlcnRpZmljYXRlP2Jhc2U/
// SIG // b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlvbkF1dGhvcml0
// SIG // eTANBgkqhkiG9w0BAQsFAAOCAgEAKLdKhpqPH6QBaM3C
// SIG // AOqQi8oA4WQeZLW3QOXNmWm7UA018DQEa1yTqEQbuD5O
// SIG // lR1Wu/F289DmXNTdsZM4GTKEaZehIiVaMoLvEJtu5h6C
// SIG // TyfWqPetNyOJqR1sGqod0Xwn5/G/zcTYSxn5K3N8Kdlc
// SIG // DrZAIyfq3yaEJYHGnA9eJ/f1RrfbJgeo/RAhICctOONw
// SIG // fpsBXcgiTuTmlD/k0DqogvzJgPq9GOkIyX/dxk7IkPzX
// SIG // /n484s0zHR4IKU58U3G1oPSQmZ5OHAvgHaEASkdN5E20
// SIG // HyJv5zN7du+QY08fI+VIci6pagLfXHYaTX3ZJ/MUM9XU
// SIG // +oU5y4qMLzTj1JIG0LVfuHK8yoB7h2inyTe7bn6h2G8N
// SIG // xZ02aKZ0xa+n/JnoXKNsaVPG1SoTuItMsXV5pQtIShsB
// SIG // qnXqFjY3bJMlMhIofMcjiuOwRCW+prZ+PoYvE2P+ML7g
// SIG // s3L65GZ9BdKF3fSW3TvmpOujPQ23rzSle9WGxFJ02fNb
// SIG // aF9C7bG44uDzMoZU4P+uvQaB7KE4OMqAvYYfFy1tv1dp
// SIG // VIN/qhx0H/9oNiOJpuZZ39ZibLt9DXbsq5qwyHmdJXai
// SIG // sxwB53wJshUjc1i76xqFPUNGb8EZQ3aFKl2w9B47vfBi
// SIG // +nU3sN0tpnLPtew4LHWq4LBD5uiNZVBOYosZ6BKhSlk1
// SIG // +Y/0y1IxghUdMIIVGQIBATBYMEExEzARBgoJkiaJk/Is
// SIG // ZAEZFgNHQkwxEzARBgoJkiaJk/IsZAEZFgNBTUUxFTAT
// SIG // BgNVBAMTDEFNRSBDUyBDQSAwMQITNgAAAToDcJXiAOAu
// SIG // HQABAAABOjANBglghkgBZQMEAgEFAKCBrjAZBgkqhkiG
// SIG // 9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgorBgEEAYI3AgEL
// SIG // MQ4wDAYKKwYBBAGCNwIBFTAvBgkqhkiG9w0BCQQxIgQg
// SIG // 9dWAjCmbnLEc7uY/WfYsYPh5ALex4hYI1gN83TVH3SMw
// SIG // QgYKKwYBBAGCNwIBDDE0MDKgFIASAE0AaQBjAHIAbwBz
// SIG // AG8AZgB0oRqAGGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bTANBgkqhkiG9w0BAQEFAASCAQBwjFJtgm54zAvATHTh
// SIG // zDdpKLZuu8INl+vABPdSQVfE23TCanmgPQw2sxiD3eyw
// SIG // BJd0NLeXCgRz+KYKzUuzOFJYr4qT7rDSuICtZ2N/eBDY
// SIG // HNaB8Ez27O57yVaqfBMwFLTCfuEIiTLZQAuSlnvK3mPr
// SIG // Ujoi5luap7i1x1mTn1PFJVE2VCL8F99tcGn2Sp/J5lJi
// SIG // 50Sh5N3h07aZ+LjxG2riG/iFszGkgDyXyNdDo7NXoYXU
// SIG // Ums6L+cPsjFO4rNLAqLbuyhU5anUIJDXlnMaCduVA1od
// SIG // pc6H4L45QZUVhQRgx1Ll4vH4NIIG50VMH8St8mXigjR/
// SIG // Qr/gco7Xf9rwUh2zoYIS5TCCEuEGCisGAQQBgjcDAwEx
// SIG // ghLRMIISzQYJKoZIhvcNAQcCoIISvjCCEroCAQMxDzAN
// SIG // BglghkgBZQMEAgEFADCCAVEGCyqGSIb3DQEJEAEEoIIB
// SIG // QASCATwwggE4AgEBBgorBgEEAYRZCgMBMDEwDQYJYIZI
// SIG // AWUDBAIBBQAEIGKG4gfeAdTsShBSKJbN3o+P2EP4U2dD
// SIG // YlahhF+7JfOMAgZgGOIJSfEYEzIwMjEwMjA0MDI0OTA0
// SIG // LjA2M1owBIACAfSggdCkgc0wgcoxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNh
// SIG // IE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBUU1Mg
// SIG // RVNOOkU1QTYtRTI3Qy01OTJFMSUwIwYDVQQDExxNaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIOPDCCBPEw
// SIG // ggPZoAMCAQICEzMAAAFHnY/x5t4xg1kAAAAAAUcwDQYJ
// SIG // KoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwHhcNMjAxMTEyMTgyNTU1WhcNMjIwMjExMTgy
// SIG // NTU1WjCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMGA1UE
// SIG // CxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEm
// SIG // MCQGA1UECxMdVGhhbGVzIFRTUyBFU046RTVBNi1FMjdD
// SIG // LTU5MkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFNlcnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IB
// SIG // DwAwggEKAoIBAQCtBQNM6X32KFk/BJ8YaprfzEt6Lj34
// SIG // G+VLjzgfEgOGSVd1Mu7nCphK0K4oyPrzItgNRjB4gUiK
// SIG // q6GzgxdDHgZPgTEvm57zsascyGrybWkf3VVr8bqf2PIg
// SIG // GvwKDNEgVcygsEbuWwXz9Li6M7AOoD4TB8fl4ATm+L7b
// SIG // 4+lYDUMJYMLzpiJzM745a0XHiriUaOpYWfkwO9Hz6uf+
// SIG // k2Hq7yGyguH8naPLMnYfmYIt2PXAwWVvG4MD4YbjXBVZ
// SIG // 14ueh7YlqZTMua3n9kT1CZDsHvz+o58nsoamXRwRFOb7
// SIG // LDjVV++cZIZLO29usiI0H79tb3fSvh9tU7QC7CirNCBY
// SIG // agNJAgMBAAGjggEbMIIBFzAdBgNVHQ4EFgQUtPjcb95k
// SIG // oYZXGy9DPxN49dSCsLowHwYDVR0jBBgwFoAU1WM6XIox
// SIG // kPNDe3xGG8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZF
// SIG // aHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwv
// SIG // cHJvZHVjdHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEu
// SIG // Y3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0
// SIG // cy9NaWNUaW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYD
// SIG // VR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAQEAUMQOyjV+ea2kEtXqD0cO
// SIG // fD2Z2PFUIy5kLkGU53RDGcfhlzIR9QlTgZLqTEhgLLuC
// SIG // Sy6jcma+nPg7e5Xg1oqCZcZJRwtRPzS1F6/M6YR35H3b
// SIG // rN0maVnPrmrQ91kkfsNqDTtuWDiAIBfkNEgCpQZCb4OV
// SIG // 3HMu5L8eZzg5dUaJ7XE+LBuphJSLFJtabxYt4fkCQxnT
// SIG // D2z50Y32ZuXiNmFFia7qVq+3Yc3mmW02+/KWH8P1HPio
// SIG // bJG8crGYgSEkxtkUXGdoutwGWW88KR9RRcM/4GKLqt2O
// SIG // Q8AWEQb7shgM8pxNvu30TxejRApa4WAfOAejTG4+KzBm
// SIG // 67XjVZ2IlXAPkjCCBnEwggRZoAMCAQICCmEJgSoAAAAA
// SIG // AAIwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENl
// SIG // cnRpZmljYXRlIEF1dGhvcml0eSAyMDEwMB4XDTEwMDcw
// SIG // MTIxMzY1NVoXDTI1MDcwMTIxNDY1NVowfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwggEiMA0GCSqGSIb3DQEB
// SIG // AQUAA4IBDwAwggEKAoIBAQCpHQ28dxGKOiDs/BOX9fp/
// SIG // aZRrdFQQ1aUKAIKF++18aEssX8XD5WHCdrc+Zitb8BVT
// SIG // JwQxH0EbGpUdzgkTjnxhMFmxMEQP8WCIhFRDDNdNuDgI
// SIG // s0Ldk6zWczBXJoKjRQ3Q6vVHgc2/JGAyWGBG8lhHhjKE
// SIG // HnRhZ5FfgVSxz5NMksHEpl3RYRNuKMYa+YaAu99h/EbB
// SIG // Jx0kZxJyGiGKr0tkiVBisV39dx898Fd1rL2KQk1AUdEP
// SIG // nAY+Z3/1ZsADlkR+79BL/W7lmsqxqPJ6Kgox8NpOBpG2
// SIG // iAg16HgcsOmZzTznL0S6p/TcZL2kAcEgCZN4zfy8wMlE
// SIG // XV4WnAEFTyJNAgMBAAGjggHmMIIB4jAQBgkrBgEEAYI3
// SIG // FQEEAwIBADAdBgNVHQ4EFgQU1WM6XIoxkPNDe3xGG8Uz
// SIG // aFqFbVUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEw
// SIG // CwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYD
// SIG // VR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYD
// SIG // VR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2Vy
// SIG // QXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4w
// SIG // TDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAx
// SIG // MC0wNi0yMy5jcnQwgaAGA1UdIAEB/wSBlTCBkjCBjwYJ
// SIG // KwYBBAGCNy4DMIGBMD0GCCsGAQUFBwIBFjFodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vUEtJL2RvY3MvQ1BTL2Rl
// SIG // ZmF1bHQuaHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBn
// SIG // AGEAbABfAFAAbwBsAGkAYwB5AF8AUwB0AGEAdABlAG0A
// SIG // ZQBuAHQALiAdMA0GCSqGSIb3DQEBCwUAA4ICAQAH5ohR
// SIG // DeLG4Jg/gXEDPZ2joSFvs+umzPUxvs8F4qn++ldtGTCz
// SIG // wsVmyWrf9efweL3HqJ4l4/m87WtUVwgrUYJEEvu5U4zM
// SIG // 9GASinbMQEBBm9xcF/9c+V4XNZgkVkt070IQyK+/f8Z/
// SIG // 8jd9Wj8c8pl5SpFSAK84Dxf1L3mBZdmptWvkx872ynoA
// SIG // b0swRCQiPM/tA6WWj1kpvLb9BOFwnzJKJ/1Vry/+tuWO
// SIG // M7tiX5rbV0Dp8c6ZZpCM/2pif93FSguRJuI57BlKcWOd
// SIG // eyFtw5yjojz6f32WapB4pm3S4Zz5Hfw42JT0xqUKloak
// SIG // vZ4argRCg7i1gJsiOCC1JeVk7Pf0v35jWSUPei45V3ai
// SIG // caoGig+JFrphpxHLmtgOR5qAxdDNp9DvfYPw4TtxCd9d
// SIG // dJgiCGHasFAeb73x4QDf5zEHpJM692VHeOj4qEir995y
// SIG // fmFrb3epgcunCaw5u+zGy9iCtHLNHfS4hQEegPsbiSpU
// SIG // ObJb2sgNVZl6h3M7COaYLeqN4DMuEin1wC9UJyH3yKxO
// SIG // 2ii4sanblrKnQqLJzxlBTeCG+SqaoxFmMNO7dDJL32N7
// SIG // 9ZmKLxvHIa9Zta7cRDyXUHHXodLFVeNp3lfB0d4wwP3M
// SIG // 5k37Db9dT+mdHhk4L7zPWAUu7w2gUDXa7wknHNWzfjUe
// SIG // CLraNtvTX4/edIhJEqGCAs4wggI3AgEBMIH4oYHQpIHN
// SIG // MIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxN
// SIG // aWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpFNUE2LUUyN0MtNTky
// SIG // RTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAq6fBtEENocNA
// SIG // SMqL03zGJS0wZd2ggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIFAOPF
// SIG // WsAwIhgPMjAyMTAyMDQwMTI0MTZaGA8yMDIxMDIwNTAx
// SIG // MjQxNlowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA48Va
// SIG // wAIBADAKAgEAAgIbWgIB/zAHAgEAAgIRNzAKAgUA48as
// SIG // QAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAKQDkuBz/Jb/IPeJnhB+BulUnjJ+
// SIG // RQSu/PACdzVhfckeQZBqdgNn+tHTi8TvNtXLqfjBUFiB
// SIG // AgdNRuRRYUZhSloac9k8YV9s8l4ZkitU2pvazIgKy/RL
// SIG // XNdVRF82wk8kDLEeqCiERiRc8D31J1FkbC+iHNE4xRu/
// SIG // FgmVdxqmUxJzMYIDDTCCAwkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAFHnY/x5t4xg1kA
// SIG // AAAAAUcwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgymVWo/yGR+5OA0N6HSE7QwZPduWkuKUGl39Bcjh0
// SIG // U28wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCB7
// SIG // 2zwSA5TPugbIiZO/2H1hrisAVItwzDscb0WqihjphTCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABR52P8ebeMYNZAAAAAAFHMCIEINyEwsq3yFf3
// SIG // 1fPSj8oeT6WzS8Ftkeng36equQMNubRJMA0GCSqGSIb3
// SIG // DQEBCwUABIIBAHFysTmbzC8RthGDw+i6KaIMKwzlSUfW
// SIG // RIytCd71Q0E8iakeHiAo1dvFd6XOEHn9gMctRYuIraAN
// SIG // YNVDIZ9VV8WQzSiDuOXeFk5MHZjDLMARprCGEXXjUozX
// SIG // WVKpbgsVfqZtsHl3RcxRgopxDtMIR1PS5ULsHseES/Is
// SIG // 32KOvK74prXfYh3IC7akBy6giuXBY9QcUpoFvAjM3lKU
// SIG // cBmnTWlzXuWk1epFKhxUPT/la27E3YEWKj6Vw8jdiKvk
// SIG // /LR6KZkukB5oIDNGayEoLrvj9ZE/uC7/mWaI7NbhkKAP
// SIG // z2ub7TLekcqFV5IGCssiCID/EyzQBRMnZ6dsQpii9Xa1wPI=
// SIG // End signature block
