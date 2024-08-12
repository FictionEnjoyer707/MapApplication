using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace MapApplication
{
    public class PointDbContext : DbContext
    {
       
        public PointDbContext(DbContextOptions options): base(options) { }

      

        public DbSet<Point> Points { get; set; }


        }
}
