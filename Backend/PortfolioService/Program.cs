using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PortfolioService.Data;
using PortfolioService.Interfaces;
using PortfolioService.Messaging;
using PortfolioService.Repository;
using RabbitMQ.Client;
using Scalar.AspNetCore;
using System.IdentityModel.Tokens.Jwt;

namespace PortfolioService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<PortfolioDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sql =>
                    {
                        sql.EnableRetryOnFailure(
                            maxRetryCount: 10,
                            maxRetryDelay: TimeSpan.FromSeconds(15),
                            errorNumbersToAdd: null
                        );
                    }
                )
            );
            builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();

            builder.Services.Configure<RabbitMQConfig>(builder.Configuration.GetSection("RabbitMQ"));

            builder.Services.AddSingleton<IConnection>(sp =>
            {
                var factory = new ConnectionFactory
                {
                    HostName = builder.Configuration["RabbitMQ:Hostname"]!,
                    UserName = builder.Configuration["RabbitMQ:Username"]!,
                    Password = builder.Configuration["RabbitMQ:Password"]!
                };
                return factory.CreateConnectionAsync().Result;
            });

            builder.Services.AddSingleton<UsernameClient>();
            
            builder.Services.AddHostedService(sp =>
                sp.GetRequiredService<UsernameClient>());
            
            builder.Services.AddScoped<IMessagePublisher, RabbitMqPublisher>();

            builder.Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling =
                        Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["JWT:Issuer"],

                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["JWT:Audience"],

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]!)),

                        NameClaimType = JwtRegisteredClaimNames.Sub
                    };
                });

            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "Portfolio API", Version = "v1" });

                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });

                option.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new string[]{}
                    }
                });
            });

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy
                        .WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

                var retries = 30;
                while (retries > 0)
                {
                    try
                    {
                        db.Database.Migrate();
                        break;
                    }
                    catch (Exception ex)
                    {
                        retries--;
                        logger.LogWarning(ex, "DB not ready yet, retries left: {Retries}", retries);

                        if (retries == 0)
                            throw;

                        Thread.Sleep(5000);
                    }
                }
            }


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseCors();
            app.MapControllers();

            app.Run();
        }
    }
}
