from rest_framework.throttling import SimpleRateThrottle


class RoleBasedThrottle(SimpleRateThrottle):
    scope = "user"

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": request.user.pk,
        }

    def get_rate(self):
        if not hasattr(self, "_rate"):
            user = getattr(self, "user", None)
            self._rate = "120/min"
        return self._rate


class LoginRateThrottle(SimpleRateThrottle):
    scope = "login"
    rate = "5/min"

    def get_cache_key(self, request, view):
        ident = request.data.get("username", "") or request.META.get("REMOTE_ADDR", "")
        return self.cache_format % {"scope": self.scope, "ident": ident}
