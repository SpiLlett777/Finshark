using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Shared.Extensions
{
    public static class ClaimsExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? throw new Exception("UserId claim not found");
        }

        public static string GetUsername(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.GivenName)
                ?? user.FindFirstValue(JwtRegisteredClaimNames.GivenName)
                ?? "";
        }

        public static string GetEmail(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Email)
                ?? user.FindFirstValue(JwtRegisteredClaimNames.Email)
                ?? "";
        }
    }
}
