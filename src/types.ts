export interface Task {
  id: number;
  title: string;
  description: string;
  location: google.maps.LatLngLiteral;
  radius: number;
  completed: boolean;
  requirements: {
    type: 'code' | 'location' | 'photo' | 'quiz';
    description: string;
    validation: {
      code?: string;
      exactLocation?: google.maps.LatLngLiteral;
      exactLocationRadius?: number;
      quizQuestion?: string;
      quizOptions?: string[];
      quizAnswer?: string;
    };
  };
  hint?: string;
}

export interface MapProps {
  tasks: Task[];
  userLocation: google.maps.LatLngLiteral | null;
  onLocationUpdate: (location: google.maps.LatLngLiteral) => void;
  onTaskComplete: (taskId: number) => void;
}

export interface TaskListProps {
  tasks: Task[];
  userLocation: google.maps.LatLngLiteral | null;
  onTaskComplete: (taskId: number) => void;
} 