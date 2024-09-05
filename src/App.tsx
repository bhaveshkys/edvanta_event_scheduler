import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Trash2, Edit } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export default function EventScheduler() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    name: '',
    startTime: '',
    endTime: ''
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      setError('Failed to fetch events. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: value });
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const eventToSubmit = editingEvent || newEvent;
    const url = editingEvent 
      ? `http://localhost:3001/events/${editingEvent.id}`
      : 'http://localhost:3001/events';
    const method = editingEvent ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSubmit)
      });

      if (response.ok) {
        await fetchEvents();
        setNewEvent({ name: '', startTime: '', endTime: '' });
        setEditingEvent(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      await fetchEvents();
    } catch (error) {
      setError('Failed to delete event. Please try again.');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Scheduler</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              name="name"
              value={editingEvent ? editingEvent.name : newEvent.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={editingEvent ? editingEvent.startTime : newEvent.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={editingEvent ? editingEvent.endTime : newEvent.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <Button type="submit">{editingEvent ? 'Update Event' : 'Add Event'}</Button>
          {editingEvent && (
            <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>Cancel Edit</Button>
          )}
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="mr-2" />
            {error}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Scheduled Events</h3>
          {events.map(event => (
            <div key={event.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md mb-2">
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                </p>
              </div>
              <div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}