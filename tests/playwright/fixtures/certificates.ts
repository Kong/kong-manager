interface Certificate {
  cert: string
  key: string
  subject: string
  issuer: string
  notAfterFormattedUTC: RegExp
  subjectAltNameFormatted: string
  keyUsages: string[ ]
}

interface CACertificate {
  cert: string
  issuer: string
  notAfterFormattedUTC: RegExp
  keyUsages: string[ ]
}

const certLegacy: Certificate = {
  cert: `-----BEGIN CERTIFICATE-----
MIIC2DCCAcACCQC32eFOsWpKojANBgkqhkiG9w0BAQsFADAuMRcwFQYDVQQDDA5z
ZWN1cmUtZm9vLWJhcjETMBEGA1UECgwKa29uZ2hxLm9yZzAeFw0xODEyMTgyMTI4
MDBaFw0xOTEyMTgyMTI4MDBaMC4xFzAVBgNVBAMMDnNlY3VyZS1mb28tYmFyMRMw
EQYDVQQKDAprb25naHEub3JnMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAqhl/HSwV6PbMv+cMFU9X+HuM7QbNNPh39GKa4pkxzFgiAnuuJ4jw9V/bzsEy
S+ZIyjzo+QKB1LzmgdcX4vkdI22BjxUd9HPHdZxtv3XilbNmSk9UOl2Hh1fORJoS
7YH+VbvVwiz5lo7qKRepbg/jcKkbs6AUE0YWFygtDLTvhP2qkphQkxZ0m8qroW91
CWgI73Ar6U2W/YQBRI3+LwtsKo0p2ASDijvqxElQBgBIiyGIr0RZc5pkCJ1eQdDB
2F6XaMfpeEyBj0MxypNL4S9HHfchOt55J1KOzYnUPkQnSoxp6oEjef4Q/ZCj5BRL
EGZnTb3tbwzHZCxGtgl9KqO9pQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAKQ5BX
kkBL+alERL31hsOgWgRiUMw+sPDtRS96ozUlPtVvAg9XFdpY4ldtWkxFcmBnhKzp
UewjrHkf9rR16NISwUTjlGIwaJu/ACQrY15v+r301Crq2DV+GjiUJFVuT495dp/l
0LZbt2Sh/uD+r3UNTcJpJ7jb1V0UP7FWXFj8oafsoFSgmxAPjpKQySTC54JK4AYb
QSnWu1nQLyohnrB9qLZhe2+jOQZnkKuCcWJQ5njvU6SxT3SOKE5XaOZCezEQ6IVL
U47YCCXsq+7wKWXBhKl4H2Ztk6x3HOC56l0noXWezsMfrou/kjwGuuViGnrjqelS
WQ7uVeNCUBY+l+qY
-----END CERTIFICATE-----
`,
  key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqGX8dLBXo9sy/
5wwVT1f4e4ztBs00+Hf0YprimTHMWCICe64niPD1X9vOwTJL5kjKPOj5AoHUvOaB
1xfi+R0jbYGPFR30c8d1nG2/deKVs2ZKT1Q6XYeHV85EmhLtgf5Vu9XCLPmWjuop
F6luD+NwqRuzoBQTRhYXKC0MtO+E/aqSmFCTFnSbyquhb3UJaAjvcCvpTZb9hAFE
jf4vC2wqjSnYBIOKO+rESVAGAEiLIYivRFlzmmQInV5B0MHYXpdox+l4TIGPQzHK
k0vhL0cd9yE63nknUo7NidQ+RCdKjGnqgSN5/hD9kKPkFEsQZmdNve1vDMdkLEa2
CX0qo72lAgMBAAECggEADxMTYNJ3Xp4Ap0EioQDXGv5YDul7ZiZe+xmCAHLzJtjo
qq+rT3WjZRuJr1kPzAosiT+8pdTDDMdw5jDZvRO2sV0TDksgzHk2RAYI897OpdWw
SwWcwU9oo2X0sb+1zbang5GR8BNsSxt/RQUDzu05itJx0gltvgeIDaVR2L5wO6ja
USa8OVuj/92XtIIve9OtyK9jAzgR6LQOTFrCCEv89/vmy5Bykv4Uz8s8swZmTs3v
XJmAmruHGuSLMfXk8lBRp/gVyNTi3uMsdph5AJbVKnra5TZLguEozZKbLdNUYk0p
+aAc7rxDcH2sPqa/7DwRvei9dvd5oB3VJlxGVgC8AQKBgQDfznRSSKAD15hoSDzt
cKNyhLgWAL+MD0jhHKUy3x+Z9OCvf0DVnmru5HfQKq5UfT0t8VTRPGKmOtAMD4cf
LYjIurvMvpVzQGSJfhtHQuULZTh3dfsM7xivMqSV+9txklMAakM7vGQlOQxhrScM
21Mp5LWDU6+e2pFCrQPop0IPkQKBgQDCkVE+dou2yFuJx3uytCH1yKPSy9tkdhQH
dGF12B5dq8MZZozAz5P9YN/COa9WjsNKDqWbEgLEksEQUq4t8SBjHnSV/D3x7rEF
qgwii0GETYxax6gms8nueIqWZQf+0NbX7Gc5mTqeVb7v3TrhsKr0VNMFRXXQwP2E
M/pxJq8q1QKBgQC3rH7oXLP+Ez0AMHDYSL3LKULOw/RvpMeh/9lQA6+ysTaIsP3r
kuSdhCEUVULXEiVYhBug0FcBp3jAvSmem8cLPb0Mjkim2mzoLfeDJ1JEZODPoaLU
fZEbj4tlj9oLvhOiXpMo/jaOGeCgdPN8aK86zXlt+wtBao0WVFnF4SalEQKBgQC1
uLfi2SGgs/0a8B/ORoO5ZY3s4c2lRMtsMvyb7iBeaIAuByPLKZUVABe89deXxnsL
fiaacPX41wBO2IoqCp2vNdC6DP9mKQNZQPtYgCvPAAbo+rVIgH9HpXn7AZ24FyGy
RfAbUcv3+in9KelGxZTF4zu8HqXtNXMSuOFeMT1FiQKBgF0R+IFDGHhD4nudAQvo
hncXsgyzK6QUzak6HmFji/CMZ6EU9q6A67JkiEWrYoKqIAKZ2Og8+Eucr/rDdGWc
kqlmLPBJAJeUsP/9KidBjTE5mIbn/2n089VPMBvnlt2xIcuB6+zrf2NjvlcZEyKS
Gn+T2uCyOP4a1DTUoPyoNJXo
-----END PRIVATE KEY-----
`,
  subject: 'CN=secure-foo-bar, O=konghq.org',
  issuer: 'CN=secure-foo-bar, O=konghq.org',
  notAfterFormattedUTC: /Dec 18, 2019, 9:28 PM/g, // To fix some issues on some browsers
  subjectAltNameFormatted: '',
  keyUsages: [],
}

const certWithSAN: Certificate = {
  cert: `-----BEGIN CERTIFICATE-----
MIIDlTCCAn2gAwIBAgIJALNvkt/BzN3UMA0GCSqGSIb3DQEBCwUAMBwxCzAJBgNV
BAYTAlVTMQ0wCwYDVQQDDARLb25nMB4XDTIyMDkzMDA5MzUyMloXDTMyMDkyNzA5
MzUyMlowHDELMAkGA1UEBhMCVVMxDTALBgNVBAMMBEtvbmcwggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDs/uWET+YUMTDejC6GDN3UzfTyRE8t9pQ8X3kW
Mn2DOBnJQfK7XiCVi6Uv6cWRWKsb/ITHddRigKj5WPiRqrmYvtXvOZLqHj9OSjQa
IJszh8wIR7mxJq//9Sq94NNzjMvUUvFoDHx1CzoDUdwhxr8J9aUIEo6AtEk6xr1l
4yg80oEIA24kd/EVs76jYDTX4cejM0oOk0IQPsAZ10k4X/UZr3kVLAuTrgup4L15
uyxebXeZY1SX3KdtOuBQzppaiWuR/Tk4oTLD2Htw/dcgOIjRpntz1gvFMX56xgNN
1+0hr2d3D1LLTcRbCVHR+2avrpSvYbeCKwslPLedMsMlSaHbAgMBAAGjgdkwgdYw
HQYDVR0OBBYEFCoj/IWxxUg0HaBuoimtzKdiya0cMEwGA1UdIwRFMEOAFCoj/IWx
xUg0HaBuoimtzKdiya0coSCkHjAcMQswCQYDVQQGEwJVUzENMAsGA1UEAwwES29u
Z4IJALNvkt/BzN3UMAwGA1UdEwQFMAMBAf8wCwYDVR0PBAQDAgL8MCUGA1UdEQQe
MByCC2V4YW1wbGUuY29tgg0qLmV4YW1wbGUuY29tMCUGA1UdEgQeMByCC2V4YW1w
bGUuY29tgg0qLmV4YW1wbGUuY29tMA0GCSqGSIb3DQEBCwUAA4IBAQDK0G4ryd7o
Lgv/A09CvAXDrgZJcG+4gFMx9i0+DpocepvZyoJ4We2jyENa7kJFiwQsA2lgDsQP
u34xtsu9nb5/t/faTpoz7CaRCkn2e/p0U9Ye58ZXCMxwInsdLx0OR8OlmrbxhojA
fIt2Ne3QSdzD5/SNSPXRj5tq6bUMAO+qUEuuzQiYQPMqf+0hBuioRh6mbZIkisLx
ZpsDcAE/1yA9cB/xM3m+yxh5LCSeZ/z6HPrM7oM6YhRETnI4fhHzT/ceV8xHwbK3
2TvxRXLDpMzPoKQmCdFhx3xTE4wHrvlJSWxNsz8gLA42UauoNtz0xafIwXybKd7Z
u4v3sPhu0RJR
-----END CERTIFICATE-----
`,
  key: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA7P7lhE/mFDEw3owuhgzd1M308kRPLfaUPF95FjJ9gzgZyUHy
u14glYulL+nFkVirG/yEx3XUYoCo+Vj4kaq5mL7V7zmS6h4/Tko0GiCbM4fMCEe5
sSav//UqveDTc4zL1FLxaAx8dQs6A1HcIca/CfWlCBKOgLRJOsa9ZeMoPNKBCANu
JHfxFbO+o2A01+HHozNKDpNCED7AGddJOF/1Ga95FSwLk64LqeC9ebssXm13mWNU
l9ynbTrgUM6aWolrkf05OKEyw9h7cP3XIDiI0aZ7c9YLxTF+esYDTdftIa9ndw9S
y03EWwlR0ftmr66Ur2G3gisLJTy3nTLDJUmh2wIDAQABAoIBAEpFDzRJvbayO7hi
genselBIQuzxT0b+MTJCUTYNmJvYpuwVSLZDJz72RkwfnJSSDv10Q0Amwuojm9CY
ez1bHVKq62xOxKWt2PT1+CH/+eNKOTyXDbBgiWNTN5PNszZQ90eQvqp2z0H2xLVp
n+zN1eyPGKrQ9euLlC9hPNWDPIbibqNwBn2+Mi2gCR/AUESEjsQPzwZ5VcmCEcVh
61q7h03IFmI24k6odVrItue9intIyiSF3GEfbkrjrkWEh15FLyUoLB0ApUmBvsKM
Acq+nNd8KfF8601ifOUSXPpgGDCwE5W/+mlA4p2hxsOrjdBBu93OLObgA7E7jj1k
XolzsZECgYEA/7+Hhlb1zyG/QzWVg4KVM7jLGuO1JXEb7P00vk+e/DPCG1u/o2JS
z4xiDnIB6xcP7gvp6+0mPSPx3hQ5cbSgzBSsiu570/kMtQe4lHqqP6EeXE47vwr8
/EYFEsqHn+xCjI4QRBMqKgHcNAEBOsXKwg1ifi+AlkgGB+DH2Y/qLFcCgYEA7Tqj
0X5seE+EnVXkOF2KXJ1Rb2HOuiPWRoRR9iwaHozWTepRs3w8GQyKwN+7OL4c+jE1
44gWhno40Kl9PY3LiaWo0Lo4FrHHaLkPW9dI7/2wKlgy25gN8HlrIcOkoXXW5sD3
E/0tZtzZMvz/ozQCu9QBPACP2YnViw2UhT6wxB0CgYBWS+iNGhbDl92T7ibPQ2bZ
FwfhwOhFBA+qPh5oATHiZAyhcqoNlYXf5rzHpwyiqRuE9ZwvMcxvYQuiJizkA1Em
y+sUzjgWZLk29K4B3ApKgjFecD+UzT5kWbQojRKKkgw6pU0zy0u09P+6xIQHsuoh
5KZRcfHvw8nVKrIE5Zzc7QKBgQCH3y40rtQxlFnAQ5GTNwAoS3J4+OwOcLgpa2AG
Pvw2wzN7LNnekylYr3ZJQdtZhInUQps61pcQLrCb0neI6c3J6Lfn1MCLPweXU2cY
kxWTXxmnJxz56P0S3ngdvpBsabHMOHlLWZbHc3ZzXbSNJRzrt2F9nFTHo8pK+lw2
dNGJgQKBgQC64/4y3pIIefV+orFUcL3uFZJu54Tz7qFE33ANcvVKTl02CePie2uS
/SApjuuNPS8BaPPabPJKyOf15lnILWl2NAjANROE6fZlejyuwG4QATHEsNkPaXlj
qHL/5OriV8Dfo7Wxs3INfTd40kgBPqO2rhh6lKr5I8Sog9S/y062bA==
-----END RSA PRIVATE KEY-----
`,
  subject: 'C=US, CN=Kong',
  issuer: 'C=US, CN=Kong',
  notAfterFormattedUTC: /Sep 27, 2032, 9:35 AM/g, // To fix some issues on some browsers
  subjectAltNameFormatted: 'dns=example.com, *.example.com',
  keyUsages: [
    'digitalSignature', 'nonRepudiation', 'keyEncipherment', 'dataEncipherment', 'keyAgreement', 'keyCertSign',
  ],
}

const certOfCA: CACertificate = {
  cert: `-----BEGIN CERTIFICATE-----
MIIFoTCCA4mgAwIBAgIUQDBLwIychoRbVRO44IzBBk9R4oYwDQYJKoZIhvcNAQEL
BQAwWDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFTATBgNVBAoM
DEtvbmcgVGVzdGluZzEdMBsGA1UEAwwUS29uZyBUZXN0aW5nIFJvb3QgQ0EwHhcN
MTkwNTAyMTkzNDQyWhcNMzkwNDI3MTkzNDQyWjBYMQswCQYDVQQGEwJVUzETMBEG
A1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UECgwMS29uZyBUZXN0aW5nMR0wGwYDVQQD
DBRLb25nIFRlc3RpbmcgUm9vdCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCC
AgoCggIBAMp6IggUp3aSNRbLAac8oOkrbUnFuxtlKGYgg8vfA2UU71qTktigdwO6
Kod0/M+daO3RDqJJXQL2rD14NDO3MaextICanoQSEe+nYyMFUIk+QplXLD3fbshU
nHoJcMS2w0x4cm1os4ebxR2Evndo6luz39ivcjau+BL+9iBAYL1g6+eGOjcSy7ft
1nAMvbxcQ7dmbAH2KP6OmF8cok+eQWVqXEjqtVx5GDMDlj1BjX6Kulmh/vhNi3Hr
NEi+kPrw/YtRgnqnN0sv3NnAyKnantxy7w0TDicFjiBsSIhjB5aUfWYErBR+Nj/m
uumwc/kRJcHWklqDzxrZKCIyOyWcE5Dyjjr46cnF8HxhYwgZcwkmgTtaXOLpBMlo
XUTgOQrWpm9HYg2vOJMMA/ZPUJ2tJ34/4RgiA00EJ5xG8r24suZmT775l+XFLFzp
Ihxvs3BMbrWsXlcZkI5neNk7Q/1jLoBhWeTYjMpUS7bJ/49YVGQZFs3xu2IcLqeD
5WsB1i+EqBAI0jm4vWEynsyX+kS2BqAiDtCsS6WYT2q00DTeP5eIHh/vHsm75jJ+
yUEb1xFxGnNevLKNTcHUeXxPUnowdC6wqFnaJm7l09qVGDom7tLX9i6MCojgpAP0
hMpBxzh8jLxHh+zZQdiORSFdYxNnlnWwbic2GUJruiQVLuhpseenAgMBAAGjYzBh
MB0GA1UdDgQWBBQHT/IIheEC2kdBxI/TfGqUxWJw9zAfBgNVHSMEGDAWgBQHT/II
heEC2kdBxI/TfGqUxWJw9zAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIB
hjANBgkqhkiG9w0BAQsFAAOCAgEAqXZjy4EltJCRtBmN0ohAHPWqH4ZJQCI2HrM3
wHB6c4oPWcJ+M2PfmYPUJo9VMjvn4S3sZuAysyoHduvRdGDnElW4wglL1xxpoUOx
FqoZUoYWV8hDFmUTWM5b4CtJxOPdTAd8VgypulM3iUEzBQrjR6tnMOdkiFMOmVag
0/Nnr+Tcfk/crMCx3xsVnisYjJoQBFBH4UY+gWE/V/MS1Sya4/qTbuuCUq+Qym5P
r8TkWAJlg7iVVLbZ2j94VUdpiQPWJEGMtJck/NEmOTruhhQlT7c1u/lqXCGj7uci
LmhLsBVmdtWT9AWS8Rl7Qo5GXbjxKIaP3IM9axhDLm8WHwPRLx7DuIFEc+OBxJhz
wkr0g0yLS0AMZpaC6UGbWX01ed10U01mQ/qPU5uZiB0GvruwsYWZsyL1QXUeqLz3
/KKrx3XsXjtBu3ZG4LAnwuxfeZCNw9ofg8CqF9c20ko+7tZAv6DCu9UL+2oZnEyQ
CboRDwpnAlQ7qJVSp2xMgunO3xxVMlhD5LZpEJz1lRT0nQV3uuLpMYNM4FS9OW/X
MZSzwHhDdCTDWtc/iRszimOnYYV8Y0ubJcb59uhwcsHmdfnwL9DVO6X5xyzb8wsf
wWaPbub8SN2jKnT0g6ZWuca4VwEo1fRaBkzSZDqXwhkBDWP8UBqLXMXWHdZaT8NK
0NEO74c=
-----END CERTIFICATE-----
`,
  issuer: 'C=US, ST=California, O=Kong Testing, CN=Kong Testing Root CA',
  notAfterFormattedUTC: /Apr 27, 2039, 7:34 PM/g, // To fix some issues on some browsers
  keyUsages: [
    'digitalSignature', 'keyCertSign', 'cRLSign',
  ],
}

const certificates = {
  legacy: certLegacy,
  san: certWithSAN,
  ca: certOfCA,
}

export default certificates
