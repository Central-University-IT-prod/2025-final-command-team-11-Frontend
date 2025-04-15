"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

import { $adminApi } from "@acme/api"

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types"
import type { TFloorLayout } from "~/entities/floor-layout/model/floor-layout.types"

export function useFloorEditor() {
  const [floors, setFloors] = useState<TFloorLayout[]>([])
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null)
  const [floorToDelete, setFloorToDelete] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false)

  const {
    data: floorsData,
    isLoading: isLoadingFloors,
    error: floorsError,
    refetch: refetchFloors,
  } = $adminApi.useQuery("get", "/layout/floors")

  const { data: floorEntitiesData } = $adminApi.useQuery(
    "get",
    "/layout/floors/{id}",
    {
      params: {
        path: { id: selectedFloorId ?? "" },
      },
    },
    {
      enabled: !!selectedFloorId,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  )

  const deleteFloorMutation = $adminApi.useMutation(
    "delete",
    "/layout/floors/{id}",
    {
      onError: (error) => {
        toast.error("Не удалось удалить этаж", {
          description: error.error,
        });
      },
      onSuccess: () => {
        toast.success("Этаж удален успешно");
      },
    },
  );
  const saveFloorMutation = $adminApi.useMutation("post", "/layout/floors", {
    onError: (error) => {
      toast.error("Не удалось сохранить этаж", {
        description: error.error,
      });
    },
    onSuccess: () => {
      toast.success("Этаж сохранен успешно");
    },
  });

  useEffect(() => {
    if (floorsData && !initialLoadCompleted) {
      console.log("[useFloorEditor] Начальные данные этажей из API:", floorsData)

      const mappedFloors: TFloorLayout[] = floorsData.map((floor) => ({
        id: floor.id ?? uuidv4(),
        name: floor.name ?? "Безымянный этаж",
        entities: [],
        createdAt: floor.created_at ? new Date(floor.created_at) : new Date(),
        updatedAt: floor.updated_at ? new Date(floor.updated_at) : new Date(),
      }))

      console.log("[useFloorEditor] Преобразованные этажи:", mappedFloors)

      setFloors(mappedFloors)
      setInitialLoadCompleted(true)
    }
  }, [floorsData, initialLoadCompleted])

  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      console.log("[useFloorEditor] Автоматический выбор первого этажа:", floors[0]?.id)
      setSelectedFloorId(floors[0]?.id ?? null)
    }
  }, [floors, selectedFloorId])

  useEffect(() => {
    if (floorsError) {
      toast.error("Не удалось загрузить этажи. Пожалуйста, попробуйте снова.")
      console.error("[useFloorEditor] Ошибка загрузки этажей:", floorsError)
    }
  }, [floorsError])

  useEffect(() => {
    if (selectedFloorId && floorEntitiesData) {
      console.log("[useFloorEditor] Загружены объекты для этажа:", selectedFloorId, floorEntitiesData)

      setFloors((prevFloors) => {
        if (prevFloors.length === 0 && floorsData) {
          console.log("[useFloorEditor] Восстановление этажей из данных API")
          prevFloors = floorsData.map((floor) => ({
            id: floor.id ?? uuidv4(),
            name: floor.name ?? "Безымянный этаж",
            entities: [],
            createdAt: floor.created_at ? new Date(Number(floor.created_at) * 1000) : new Date(),
            updatedAt: floor.updated_at ? new Date(Number(floor.updated_at) * 1000) : new Date(),
          }))
        }

        const updatedFloors = prevFloors.map((floor) => {
          if (floor.id === selectedFloorId) {
            return {
              ...floor,
              entities: floorEntitiesData.map((entity) => ({
                ...(entity as TBookingEntity),
                floor_id: floor.id,
              })),
            }
          }
          return floor
        })

        console.log("[useFloorEditor] Обновленные этажи с объектами:", updatedFloors)
        return updatedFloors
      })
    }
  }, [selectedFloorId, floorEntitiesData, floorsData])

  const updateFloors = useCallback((updatedFloors: TFloorLayout[]) => {
    console.log("[useFloorEditor] updateFloors вызван с:", updatedFloors)

    setFloors((prevFloors) => {
      const mergedFloors = updatedFloors.map((updatedFloor) => {
        const prevFloor = prevFloors.find((f) => f.id === updatedFloor.id)
        if (prevFloor && prevFloor.entities.length > 0 && updatedFloor.entities.length === 0) {
          return {
            ...updatedFloor,
            entities: prevFloor.entities,
          }
        }
        return updatedFloor
      })

      console.log("[useFloorEditor] Объединенные этажи:", mergedFloors)
      return mergedFloors
    })

    setIsDirty(true)
  }, [])

  const createNewFloor = useCallback(() => {
    console.log("[useFloorEditor] Создание нового этажа")
    const newFloorId = uuidv4()
    const newFloorNumber = floors.length + 1

    const newFloor: TFloorLayout = {
      id: newFloorId,
      name: `Этаж ${newFloorNumber}`,
      entities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setFloors((prev) => [...prev, newFloor])
    setSelectedFloorId(newFloorId)
    setIsDirty(true)

    void saveFloorMutation
      .mutateAsync({
        body: newFloor,
      })
      .then(() => {
        toast.success("Новый этаж создан");
      })
      .catch((error) => {
        console.error("[useFloorEditor] Error creating floor:", error);
        toast.error("Не удалось создать этаж. Пожалуйста, попробуйте снова.");
      });
  }, [floors.length, saveFloorMutation]);

  const deleteFloor = useCallback(
    (floorId: string) => {
      console.log("[useFloorEditor] Удаление этажа:", floorId)
      if (floors.length <= 1) {
        return
      }

      setFloorToDelete(floorId)
    },
    [floors.length],
  )

  const confirmDeleteFloor = useCallback(async () => {
    if (!floorToDelete) return
    console.log("[useFloorEditor] Подтверждение удаления этажа:", floorToDelete)

    try {
      await deleteFloorMutation.mutateAsync({
        params: {
          path: { id: floorToDelete },
        },
      })

      setFloors((prev) => prev.filter((floor) => floor.id !== floorToDelete))

      if (selectedFloorId === floorToDelete) {
        const remainingFloors = floors.filter((floor) => floor.id !== floorToDelete)
        setSelectedFloorId(remainingFloors.length > 0 ? (remainingFloors[0]?.id ?? null) : null)
      }

      toast.success("Этаж удален успешно");
    } catch (error) {
      console.error("[useFloorEditor] Error deleting floor:", error);
      toast.error("Не удалось удалить этаж. Пожалуйста, попробуйте снова.");
    } finally {
      setFloorToDelete(null)
    }
  }, [floorToDelete, deleteFloorMutation, selectedFloorId, floors])

  const cancelDeleteFloor = useCallback(() => {
    setFloorToDelete(null)
  }, [])

  const saveChanges = useCallback(async () => {
    if (!selectedFloorId) return
    console.log("[useFloorEditor] Сохранение изменений этажа")

    const selectedFloor = floors.find((floor) => floor.id === selectedFloorId)
    if (!selectedFloor) return

    try {
      await saveFloorMutation.mutateAsync({
        body: {
          id: selectedFloor.id,
          name: selectedFloor.name,
          entities: selectedFloor.entities,
        },
      })

      setIsDirty(false);
      toast.success("Этаж сохранен успешно");
    } catch (error) {
      console.error("[useFloorEditor] Error saving floor:", error);
      toast.error("Не удалось сохранить этаж. Пожалуйста, попробуйте снова.");
    }
  }, [selectedFloorId, floors, saveFloorMutation, refetchFloors])

  return {
    floors,
    selectedFloorId,
    floorToDelete,
    isDirty,
    isLoadingFloors,

    isSaving: saveFloorMutation.isPending,
    isDeleting: deleteFloorMutation.isPending,

    setSelectedFloorId,
    createNewFloor,
    deleteFloor,
    confirmDeleteFloor,
    cancelDeleteFloor,
    saveChanges,
    updateFloors,
  }
}

