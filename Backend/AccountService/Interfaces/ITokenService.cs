using AccountService.Models;

namespace AccountService.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(AppUser user);
    }
}
