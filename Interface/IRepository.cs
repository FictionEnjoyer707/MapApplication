using MapApplication.Services;

namespace MapApplication.Interface
{
    public interface IRepository<T> where T : class 
    { 
        ApiResponse<List<T>> GetAll() ;
        ApiResponse<T> GetById(int id);
        ApiResponse<T> Delete(int id);
        ApiResponse<T> Add(T entity);

    }
}
