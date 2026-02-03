import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit, Archive, Eye, CheckCircle } from "lucide-react";

export default function CourseManager({ lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['allCourses'],
    queryFn: () => base44.entities.Course.list('-created_date')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Course.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
    }
  });

  const filteredCourses = courses.filter(c => {
    const title = c.title_en + (c.title_es || '');
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-amber-100 text-amber-700"
  };

  const text = {
    en: {
      title: "Course Management",
      search: "Search courses...",
      newCourse: "New Course",
      status: "Status",
      actions: "Actions",
      publish: "Publish",
      unpublish: "Unpublish",
      archive: "Archive",
      edit: "Edit",
      view: "View",
      noCourses: "No courses found."
    },
    es: {
      title: "Gestión de Cursos",
      search: "Buscar cursos...",
      newCourse: "Nuevo Curso",
      status: "Estado",
      actions: "Acciones",
      publish: "Publicar",
      unpublish: "Despublicar",
      archive: "Archivar",
      edit: "Editar",
      view: "Ver",
      noCourses: "No se encontraron cursos."
    }
  };

  const t = text[lang];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">{t.title}</h2>
        <Link to={createPageUrl(`CourseEditor?lang=${lang}`)}>
          <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a] gap-2">
            <Plus className="w-4 h-4" />
            {t.newCourse}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{lang === 'es' ? 'Título' : 'Title'}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{lang === 'es' ? 'Idiomas' : 'Languages'}</TableHead>
              <TableHead>{lang === 'es' ? 'Creado' : 'Created'}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e3a5f] mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  {t.noCourses}
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map(course => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.title_en}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[course.status]}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {course.language_availability?.map(l => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(course.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`Course?id=${course.id}&lang=${lang}`)} className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {t.view}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`CourseEditor?id=${course.id}&lang=${lang}`)} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            {t.edit}
                          </Link>
                        </DropdownMenuItem>
                        {course.status !== 'published' && (
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'published' })}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t.publish}
                          </DropdownMenuItem>
                        )}
                        {course.status === 'published' && (
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'draft' })}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            {t.unpublish}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'archived' })}
                          className="flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          {t.archive}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}