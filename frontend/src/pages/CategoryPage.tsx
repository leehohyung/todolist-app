import { useState } from 'react';
import { useCategories } from '../hooks/category/useCategories';
import AppLayout from '../components/common/AppLayout';
import Modal from '../components/common/Modal';
import CategoryMenu from '../components/category/CategoryMenu';
import CategoryForm from '../components/category/CategoryForm';
import Button from '../components/common/Button';

const CategoryPage = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <AppLayout
      title="카테고리"
      action={
        <Button variant="primary" size="md" onClick={() => setFormOpen(true)}>
          + 새 카테고리
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-text-secondary mb-4">
            총 <span className="font-semibold text-text-primary">{categories.length}</span>개의 카테고리
          </p>
          <CategoryMenu categories={categories} />
        </>
      )}

      <Modal isOpen={formOpen} title="새 카테고리 추가" onClose={() => setFormOpen(false)} size="sm">
        <CategoryForm onClose={() => setFormOpen(false)} />
      </Modal>
    </AppLayout>
  );
};

export default CategoryPage;
