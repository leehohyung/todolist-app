import { useState } from 'react';
import { useCategories } from '../hooks/category/useCategories';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import CategoryMenu from '../components/category/CategoryMenu';
import CategoryForm from '../components/category/CategoryForm';
import Button from '../components/common/Button';

const CategoryPage = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">카테고리 관리</h1>
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            + 카테고리 추가
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-text-muted text-sm">로딩 중...</div>
        ) : (
          <CategoryMenu categories={categories} />
        )}
      </main>

      <Modal isOpen={formOpen} title="카테고리 추가" onClose={() => setFormOpen(false)}>
        <CategoryForm onClose={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
};

export default CategoryPage;
