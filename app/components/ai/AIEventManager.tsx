'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  BarChart3,
  Sparkles,
  Settings
} from 'lucide-react';
import { aiEventService, AIEventOptimization, AIEventSuggestion } from '@/app/lib/ai-events';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

interface AIEventManagerProps {
  eventId?: string;
  eventData?: any;
  onEventUpdate?: (updatedData: any) => void;
  onApplySuggestion?: (suggestion: AIEventSuggestion) => void;
}

export default function AIEventManager({ 
  eventId, 
  eventData, 
  onEventUpdate, 
  onApplySuggestion 
}: AIEventManagerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimization, setOptimization] = useState<AIEventOptimization | null>(null);
  const [suggestions, setSuggestions] = useState<AIEventSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('optimize');
  const [selectedSuggestion, setSelectedSuggestion] = useState<AIEventSuggestion | null>(null);

  useEffect(() => {
    if (eventId) {
      analyzeEvent();
    }
    generateSuggestions();
  }, [eventId]);

  const analyzeEvent = async () => {
    if (!eventId) return;
    
    try {
      setIsAnalyzing(true);
      const analysis = await aiEventService.analyzeEvent(eventId);
      setOptimization(analysis);
    } catch (error) {
      console.error('Failed to analyze event:', error);
      toast.error('Failed to analyze event');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      const suggestions = await aiEventService.generateEventSuggestions(userResponse.data.user);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const applyOptimization = async (updates: any[]) => {
    if (!eventId) return;
    
    try {
      setIsAnalyzing(true);
      await aiEventService.optimizeEvent(eventId, updates);
      
      // Refresh event data
      if (onEventUpdate) {
        const response = await api.get(`/events/${eventId}`);
        onEventUpdate(response.data.data);
      }
      
      toast.success('Event optimized successfully!');
      analyzeEvent(); // Re-analyze after optimization
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      toast.error('Failed to optimize event');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: AIEventSuggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
  };

  const generateContent = async () => {
    if (!eventData) return;
    
    try {
      setIsAnalyzing(true);
      const content = await aiEventService.generateEventContent(eventData);
      
      if (onEventUpdate) {
        onEventUpdate({
          ...eventData,
          title: content.title,
          description: content.description,
          tags: content.tags,
          requirements: content.requirements
        });
      }
      
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOptimalPricing = async () => {
    if (!eventData) return;
    
    try {
      setIsAnalyzing(true);
      const pricing = await aiEventService.getPricingRecommendations(eventData);
      
      toast.success(`Suggested price: $${pricing.suggestedPrice} - ${pricing.reasoning}`);
      
      if (onEventUpdate) {
        onEventUpdate({
          ...eventData,
          price: pricing.suggestedPrice
        });
      }
    } catch (error) {
      console.error('Failed to get pricing recommendations:', error);
      toast.error('Failed to get pricing recommendations');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOptimalSchedule = async () => {
    if (!eventData) return;
    
    try {
      setIsAnalyzing(true);
      const schedule = await aiEventService.generateOptimalSchedule(eventData);
      
      if (schedule.bestDateTime.date && schedule.bestDateTime.time) {
        toast.success(`Optimal schedule: ${schedule.bestDateTime.date} at ${schedule.bestDateTime.time}`);
        
        if (onEventUpdate) {
          onEventUpdate({
            ...eventData,
            date: schedule.bestDateTime.date,
            time: schedule.bestDateTime.time
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate optimal schedule:', error);
      toast.error('Failed to generate optimal schedule');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictSuccess = async () => {
    if (!eventData) return;
    
    try {
      setIsAnalyzing(true);
      const prediction = await aiEventService.predictEventSuccess(eventData);
      
      toast.success(`Success Score: ${(prediction.successScore * 100).toFixed(1)}% - Revenue Projection: $${prediction.revenueProjection}`);
    } catch (error) {
      console.error('Failed to predict success:', error);
      toast.error('Failed to predict success');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Event Manager</span>
            <Badge className="bg-purple-100 text-purple-800">BETA</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Let AI help you optimize your events for maximum success and revenue
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
              <TabsTrigger value="suggest">Suggest</TabsTrigger>
              <TabsTrigger value="predict">Predict</TabsTrigger>
            </TabsList>

            <TabsContent value="optimize" className="space-y-4">
              {eventId && optimization ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Overall Score</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {(optimization.overallScore * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Revenue Potential</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          +${optimization.potentialRevenueIncrease}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Attendance Potential</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          +{optimization.potentialAttendanceIncrease}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Optimization Suggestions
                    </h4>
                    
                    {optimization.suggestions.map((suggestion, index) => (
                      <Card key={index} className="border-l-4 border-blue-400">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant={
                                  suggestion.impact === 'high' ? 'destructive' :
                                  suggestion.impact === 'medium' ? 'default' : 'secondary'
                                }>
                                  {suggestion.impact} impact
                                </Badge>
                                <span className="text-sm font-medium">{suggestion.field}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-500">Current: {suggestion.currentValue}</span>
                                <span className="text-green-600 font-medium">→ {suggestion.suggestedValue}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => applyOptimization([suggestion])}
                              disabled={isAnalyzing}
                            >
                              Apply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {optimization.priorityActions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Target className="w-4 h-4 text-red-500" />
                        Priority Actions
                      </h4>
                      <div className="space-y-2">
                        {optimization.priorityActions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-700">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {eventId ? 'Analyzing your event...' : 'Select an event to optimize'}
                  </p>
                  {eventId && (
                    <Button onClick={analyzeEvent} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Event'}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggest" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    AI-Generated Event Ideas
                  </h4>
                  <Button onClick={generateSuggestions} disabled={isAnalyzing} size="sm">
                    <Zap className="w-4 h-4 mr-1" />
                    Generate Ideas
                  </Button>
                </div>

                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((suggestion, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold">{suggestion.title}</h5>
                              <Badge className="mt-1">{suggestion.category}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Confidence</div>
                              <div className="font-semibold">
                                {(suggestion.confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3 text-green-600" />
                              <span>${suggestion.suggestedPrice}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>{suggestion.suggestedDuration}min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-purple-600" />
                              <span>{suggestion.suggestedMaxParticipants} max</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-orange-600" />
                              <span>{suggestion.optimalDate}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            {suggestion.reasoning}
                          </div>
                          
                          <Button 
                            className="w-full mt-3" 
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Use This Idea
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No suggestions available. Generate some ideas!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="predict" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  AI Predictions & Insights
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={generateContent}
                    disabled={isAnalyzing || !eventData}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Content</span>
                    </div>
                    <span className="text-xs opacity-80">AI-powered titles, descriptions, and tags</span>
                  </Button>

                  <Button 
                    onClick={getOptimalPricing}
                    disabled={isAnalyzing || !eventData}
                    className="h-auto p-4 flex flex-col items-start"
                    variant="outline"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Optimize Pricing</span>
                    </div>
                    <span className="text-xs opacity-80">Get AI pricing recommendations</span>
                  </Button>

                  <Button 
                    onClick={getOptimalSchedule}
                    disabled={isAnalyzing || !eventData}
                    className="h-auto p-4 flex flex-col items-start"
                    variant="outline"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Find Best Time</span>
                    </div>
                    <span className="text-xs opacity-80">Optimal date and time suggestions</span>
                  </Button>

                  <Button 
                    onClick={predictSuccess}
                    disabled={isAnalyzing || !eventData}
                    className="h-auto p-4 flex flex-col items-start"
                    variant="outline"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Predict Success</span>
                    </div>
                    <span className="text-xs opacity-80">AI-powered success predictions</span>
                  </Button>
                </div>

                {eventData && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">AI Insights Available</span>
                      </div>
                      <p className="text-sm text-green-700">
                        AI can analyze your event and provide personalized recommendations to maximize success.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
