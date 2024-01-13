-- RPZ REDIRECT
rpzFile("/opt/pdns-recursor/etc/rpz.redirect", {policyName="rpz.redirect"})

-- RPZ NXDOMAIN
rpzFile("/opt/pdns-recursor/etc/rpz.nxdomain", {policyName="rpz.nxdomain", defpol=Policy.NXDOMAIN})

