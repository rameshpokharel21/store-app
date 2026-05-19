package com.ramesh.backend.service;

import com.ramesh.backend.dto.request.CategoryRequest;
import com.ramesh.backend.dto.response.CategoryResponse;
import com.ramesh.backend.entity.Category;
import com.ramesh.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse createCategory(CategoryRequest request){
        if(categoryRepository.existsByName(request.name())){
            throw new IllegalArgumentException("Category name already exists: " + request.name());

        }
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        Category saved =  categoryRepository.save(category);
        return toResponse(saved);
    }

    public List<CategoryResponse> getAllCategories(){
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void deleteCategory(String id){
        if(!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);

    }

    private CategoryResponse toResponse(Category category){
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt().toString()
        );
    }
}
