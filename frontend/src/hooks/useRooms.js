import { useState, useEffect } from "react";
import { getAllRooms, findFreeRoomsByDayTime } from "../../api";
import { transformRoom } from "@/utils/roomUtils";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendRooms = await getAllRooms();
      const transformedRooms = backendRooms.map(transformRoom);
      setRooms(transformedRooms);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError(err.message || "Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return { rooms, setRooms, isLoading, setIsLoading, error, setError, fetchRooms };
}

export function useFreeRoomsSearch(searchDay, searchTime) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFreeRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const freeRooms = await findFreeRoomsByDayTime({
        day: searchDay,
        time: searchTime,
      });
      const transformedRooms = freeRooms.map((room) =>
        transformRoom({ ...room, status: "available" })
      );
      setRooms(transformedRooms);
    } catch (err) {
      console.error("Failed to find free rooms:", err);
      setError(err.message || "Failed to find free rooms");
    } finally {
      setIsLoading(false);
    }
  };

  return { rooms, setRooms, isLoading, error, searchFreeRooms };
}
