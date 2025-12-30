using Shared.Dtos.Account;
using AccountService.Interfaces;
using AccountService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<AppUser> _signInManager;
        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, SignInManager<AppUser> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var appUser = new AppUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };

            var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);

            if (!createdUser.Succeeded)
            {
                return BadRequest(new
                {
                    Errors = createdUser.Errors.Select(e => e.Description)
                });
            }

            var roleResult = await _userManager.AddToRoleAsync(appUser, "User");

            if (!roleResult.Succeeded)
            {
                return BadRequest(new
                {
                    Errors = roleResult.Errors.Select(e => e.Description)
                });
            }

            return Ok(new NewUserDto
            {
                UserName = appUser.UserName,
                Email = appUser.Email,
                Token = _tokenService.CreateToken(appUser)
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

            if (user is null)
                return Unauthorized("Invalid username!");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
                return Unauthorized("Username not found and/or password incorrect!");

            return Ok(new NewUserDto
            {
                UserName = user.UserName,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            });
        }

        [HttpGet("username/{username}")]
        public async Task<IActionResult> GetUserIdByUsername([FromRoute] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Username is required!");

            var user = await _userManager.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user is null)
                return NotFound("User is not found!");

            return Ok(new UserIdResponseDto
            {
                UserId = user.Id,
                Username = user.UserName!
            });
        }
    }
}
