-- RPZ REDIRECT
rpzFile("/etc/powerdns/rpz.redirect", {policyName="rpz.redirect"})

-- RPZ NXDOMAIN
rpzFile("/etc/powerdns/rpz.nxdomain", {policyName="rpz.nxdomain", defpol=Policy.NXDOMAIN})

