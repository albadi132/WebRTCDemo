using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using WebRTCDemo;
using WebRTCDemo.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
// Add services to the container.
builder.Services.AddDbContext<WebRTCDataContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));


var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Home/Error");
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<ChatHub>("/chatHub"); // Add this line
app.MapHub<WebRTCHub>("/webrtchub"); // Add this line

app.Run();
