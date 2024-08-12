namespace MapApplication.Interface
{
    public interface IUnitOfWork
    {
        IGenericRepository Point { get; }
       public void SaveChanges();
    }
}
