import { categories } from '@booga/db/schema';
import Service from '@/classes/Service';

class CategoriesService extends Service<typeof categories> {}

export default CategoriesService;
