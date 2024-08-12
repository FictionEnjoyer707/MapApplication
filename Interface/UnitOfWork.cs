using MapApplication.Interface;


namespace MapApplication.Interface
{
    public class UnitOfWork : IUnitOfWork
    {
        private PointDbContext _context;
        
        public IGenericRepository Point { get; private set; }

        public UnitOfWork(PointDbContext context)
        {
            _context = context;
            Point = new GenericRepository(_context);
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }
     
    }
}
