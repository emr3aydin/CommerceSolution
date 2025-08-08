using Commerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Persistence
{
    public class LogDbContext : DbContext
    {

        public LogDbContext(DbContextOptions<LogDbContext> options): base(options) { }

        public DbSet<Log> Logs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Log>().ToTable("Logs");
            base.OnModelCreating(modelBuilder);
        }

    }
}
