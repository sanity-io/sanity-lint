/**
 * Sample Sanity schemas that should NOT trigger any lint warnings.
 * Use this to verify false positives aren't happening.
 */

import { defineType, defineField } from 'sanity'
import { DocumentIcon, UserIcon } from '@sanity/icons'

// Clean: Document with all recommended properties
export const postType = defineType({
  name: 'post',
  type: 'document',
  title: 'Blog Post',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'The title of the blog post',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'URL-friendly identifier',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Content',
      description: 'The main content of the post',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      title: 'Author',
      description: 'The author of this post',
      to: [{ type: 'author' }],
    }),
  ],
})

// Clean: Object type with proper configuration
export const seoType = defineType({
  name: 'seo',
  type: 'object',
  title: 'SEO Settings',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'Title for search engines (50-60 characters)',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'Description for search engines (150-160 characters)',
      validation: (rule) => rule.max(160),
    }),
  ],
})
