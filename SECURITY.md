# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities privately through GitHub's [Report a vulnerability](https://github.com/gethomepage/homepage/security/advisories/new) form. Use [Discussions](https://github.com/gethomepage/homepage/discussions) for support, ordinary bugs, and feature or hardening requests.

Include the Homepage version or commit, deployment configuration, attacker permissions, reproduction steps, and observed security impact. Use test credentials and remove real secrets from attachments. Reproduce against the latest release or current source and explain which security boundary the behavior crosses.

## Security model

Homepage is a self-hosted dashboard that connects to services chosen by its operator. Users who can change its configuration, including service discovery inputs, are trusted. Configuration capabilities include widget request destinations and substitution of `HOMEPAGE_VAR_*` and `HOMEPAGE_FILE_*` values.

Homepage does not provide per-user resource permissions. Built-in authentication controls access to the dashboard; it does not create separate authorization levels among dashboard users. Displaying a subset of resources is not an access-control policy.

Follow the [deployment security guidance](https://gethomepage.dev/installation/). Access from untrusted networks requires authentication and appropriate reverse-proxy or VPN protection. `HOMEPAGE_ALLOWED_HOSTS` validates request hosts; it is not authentication or a client IP allowlist.

## Examples outside the security scope

The following do not, by themselves, establish a Homepage vulnerability:

- **Configuration-directed requests.** An operator setting a widget, monitor, or other configured request destination to an internal address or a server they control is using a supported capability, not demonstrating SSRF.
- **Configuration-directed disclosure.** A configuration author placing an interpolation variable in a displayed field, or sending configured credentials to a destination they choose, is not bypassing credential isolation from configuration authors. This also applies to discovery annotations and labels.
- **Assumed resource permissions.** A dashboard user querying resource statistics beyond the cards displayed on the dashboard does not bypass per-resource permissions; Homepage does not provide those permissions.
- **Host validation treated as login.** Supplying an allowed Host header does not demonstrate an authentication bypass. A publicly exposed instance with no authentication is not evidence that Homepage's authentication was bypassed.
- **Operator-controlled failure conditions.** Configuring an upstream to return excessively large responses, supplying invalid configuration that produces an error, or modifying files with existing filesystem access does not alone demonstrate an attack by a less-trusted party.
- **Upstream API conventions.** A service's documented credential parameter or authentication mechanism is not, by itself, a Homepage vulnerability. Show unintended exposure caused by Homepage.
- **Unverified dependency or code findings.** A scanner alert, affected dependency version, suspicious code pattern, or a dangerous-looking URL in an intermediate object needs a reachable exploit path and demonstrated impact in Homepage. Account for framework protections and existing checks.

Reports involving these features are welcome when they demonstrate an unintended boundary crossing, such as an attacker changing request destinations without configuration access, obtaining protected credentials, executing script in another user's browser, or bypassing enabled authentication. Explain how the attacker obtains the required control rather than assuming it.

We may accept straightforward hardening improvements without treating the original behavior as a security vulnerability. A possible misuse of a feature does not necessarily justify changing or restricting that feature.

## AI-assisted reports

Disclose AI assistance and verify the findings yourself. Reports must describe behavior you have reproduced, with realistic prerequisites and impact. Generated tests that assert a hypothetical requirement, static-analysis output, and confident descriptions of an untested attack are not substitutes for verification.

## Review expectations

Homepage is maintained by volunteers. We review reports as time permits and may request further evidence. Incomplete, duplicate, speculative, or out-of-scope reports may be closed without extended discussion. Good-faith mistakes are welcome; repeated unverified submissions may result in restrictions on further reports.
