'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import AIEventManager, { AIEventAnalysis, AIEventInsight } from '@/app/lib/ai-event-manager';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, Users, Calendar, Clock } from 'lucide-react';

interface AIEventInsightsProps {
  events: any[];
  onOptimizeEvents?: (optimizedEvents: any[]) => void;
  onGenerateContent?: (eventId: string, content: string) => void;
}

export default function AIEventInsights({ events, onOptimizeEvents, onGenerateContent }: AIEventInsightsProps) {
  const [analysis, setAnalysis] = useState<AIEventAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    if (events.length > 0) {
      analyzeEvents();
    }
  }, [events]);

  const analyzeEvents = async () => {
    try {
      setLoading(true);
      const aiManager = AIEventManager.getInstance();
      const analysisResult = await aiManager.analyzeEventData(events);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    try {
      const aiManager = AIEventManager.getInstance();
      const optimizedEvents = await aiManager.optimizeEventSchedule(events);
      onOptimizeEvents?.(optimizedEvents);
    } catch (error) {
      console.error('Schedule Optimization Error:', error);
    }
  };

  const handleGenerateContent = async (eventId: string) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (event) {
        const aiManager = AIEventManager.getInstance();
        const content = await aiManager.generateEventContent(event.title, event.category);
        onGenerateContent?.(eventId, content);
      }
    } catch (error) {
      console.error('Content Generation Error:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'optimization':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">AI is analyzing your events...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Event Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Total Events</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{analysis.performanceMetrics.totalEvents}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Avg Attendance</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {analysis.performanceMetrics.averageAttendance.toFixed(1)}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              ${analysis.performanceMetrics.revenueGenerated.toFixed(0)}
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {analysis.performanceMetrics.successRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        {analysis.performanceMetrics.popularCategories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Popular Categories</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.performanceMetrics.popularCategories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Peak Times */}
        {analysis.performanceMetrics.peakTimes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Peak Performance Times</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.performanceMetrics.peakTimes.map((time, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Insights</h4>
          <div className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'bg-red-50 border-red-200' :
                  insight.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{insight.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    {insight.actionable && (
                      <Button size="sm" variant="outline" className="mt-2">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Suggestions</h4>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{suggestion.category}</h5>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.suggestion}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      <strong>Expected Impact:</strong> {suggestion.expectedImpact}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Implementation:</strong> {suggestion.implementation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={handleOptimizeSchedule} className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Optimize Schedule
          </Button>
          <Button onClick={() => setExpandedInsight(expandedInsight === null ? 'predictions' : null)} variant="outline" className="flex-1">
            <Brain className="h-4 w-4 mr-2" />
            {expandedInsight ? 'Hide' : 'Show'} Predictions
          </Button>
        </div>

        {/* Predictions Section */}
        {expandedInsight === 'predictions' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-900 mb-3">AI Predictions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-purple-600 mb-1">Next Month Attendance</div>
                <div className="text-2xl font-bold text-purple-900">
                  {analysis.predictedOutcomes.nextMonthAttendance}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-600 mb-1">Optimal Price Point</div>
                <div className="text-2xl font-bold text-purple-900">
                  ${analysis.predictedOutcomes.recommendedPricePoint}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-600 mb-1">Best Timing</div>
                <div className="text-lg font-bold text-purple-900">
                  {analysis.predictedOutcomes.optimalEventTiming}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
