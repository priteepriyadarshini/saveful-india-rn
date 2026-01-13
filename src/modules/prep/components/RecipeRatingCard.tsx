import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import tw from '../../../common/tailwind';
import {
  bodySmallRegular,
  h7TextStyle,
  subheadMediumUppercase,
} from '../../../theme/typography';
import {
  recipeRatingApiService,
  RecipeRatingStats,
  RatingTag,
} from '../../recipeRating/api/recipeRatingApiService';

interface RecipeRatingCardProps {
  recipeId: string;
  maxHeight?: number;
  setMaxHeight?: (height: number) => void;
}

// Dynamic color palette for rating tags
const COLOR_PALETTE = [
  '#F87171', // Red/Pink
  '#FBBF24', // Yellow
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#F59E0B', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#EF4444', // Red
];

// Generate color based on tag index for consistency
const getRatingColor = (index: number): string => {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

const RecipeRatingCard: React.FC<RecipeRatingCardProps> = ({
  recipeId,
  maxHeight = 0,
  setMaxHeight,
}) => {
  const [stats, setStats] = useState<RecipeRatingStats | null>(null);
  const [allTags, setAllTags] = useState<RatingTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both active tags and rating stats in parallel
        const [tags, ratingStats] = await Promise.all([
          recipeRatingApiService.getActiveTags(),
          recipeRatingApiService.getRecipeRatingStats(recipeId),
        ]);
        
        setAllTags(tags);
        setStats(ratingStats);
      } catch (error) {
        console.error('[RecipeRatingCard] Error fetching rating data:', error);
        setStats(null);
        setAllTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      fetchRatingData();
    }
  }, [recipeId]);

  // Show loading state
  if (isLoading) {
    return (
      <View
        style={tw`items-center justify-center rounded-lg border border-strokecream bg-white px-4.5 py-6`}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (setMaxHeight && height > maxHeight) {
            setMaxHeight(height);
          }
        }}
      >
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  // Merge all tags with stats to show all tags even if they have 0 votes
  const allTagsWithStats = allTags.map(tag => {
    const existingStat = stats?.ratingBreakdown.find(rb => rb.tagName === tag.name);
    return {
      tagName: tag.name,
      count: existingStat?.count || 0,
      order: tag.order,
      percentage: stats && stats.totalRatings > 0 
        ? Math.round(((existingStat?.count || 0) / stats.totalRatings) * 100)
        : 0,
    };
  });

  // If no tags at all, show error state
  if (allTags.length === 0) {
    return (
      <View
        style={tw`rounded-lg border border-strokecream bg-white px-4.5 py-6`}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (setMaxHeight && height > maxHeight) {
            setMaxHeight(height);
          }
        }}
      >
        <Text style={tw.style('text-center', h7TextStyle)}>WHAT PEOPLE SAY</Text>
        <View style={tw.style('border-b border-strokecream pt-2.5')} />
        <View style={tw`items-center justify-center py-8`}>
          <Text style={tw.style(bodySmallRegular, 'text-center text-stone')}>
            Rating tags not available
          </Text>
        </View>
      </View>
    );
  }

  // Find the highest rating percentage for the gauge
  const highestRating = allTagsWithStats.reduce(
    (max, rating) => (rating.percentage > max.percentage ? rating : max),
    allTagsWithStats[0]
  );

  // SVG Semi-Circle parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle

  // Calculate the stroke segments for each rating (semi-circle)
  // Only include tags that have votes for the visual segments
  const createSegments = () => {
    let currentOffset = 0;
    let visualIndex = 0;
    return allTagsWithStats
      .filter(rating => rating.count > 0) // Only show segments for tags with votes
      .map((rating) => {
        const tagIndex = allTagsWithStats.findIndex(t => t.tagName === rating.tagName);
        const dashLength = (rating.percentage / 100) * circumference;
        const segment = {
          ...rating,
          strokeDasharray: `${dashLength} ${circumference}`,
          strokeDashoffset: -currentOffset,
          color: getRatingColor(tagIndex),
        };
        currentOffset += dashLength;
        visualIndex++;
        return segment;
      });
  };

  const segments = createSegments();

  return (
    <View
      style={tw`rounded-lg border border-strokecream bg-white px-4.5 py-6`}
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (setMaxHeight && height > maxHeight) {
          setMaxHeight(height);
        }
      }}
    >
      <Text style={tw.style('text-center', h7TextStyle)}>WHAT PEOPLE SAY</Text>
      <View style={tw.style('border-b border-strokecream pt-2.5')} />

      {/* Semi-Circular Gauge */}
      <View style={tw`items-center justify-center pt-6 pb-2`}>
        <View style={tw`relative items-center`}>
          <Svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
            <G rotation="-180" origin={`${size / 2}, ${size / 2}`}>
              {/* Background semi-circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#F3F4F6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Rating segments */}
              {segments.map((segment, index) => (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                />
              ))}
            </G>
          </Svg>
          {/* Center text - positioned at bottom of semi-circle */}
          <View style={tw`absolute bottom-0 items-center`}>
            <Text style={[tw`font-sans-bold text-3xl`, { color: getRatingColor(allTagsWithStats.findIndex(t => t.tagName === highestRating.tagName)) }]}>
              {highestRating.percentage}%
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-stone pt-1')}>
              {stats?.totalRatings || 0}/{stats?.totalRatings || 0} Votes
            </Text>
          </View>
        </View>
      </View>

      {/* Spacing between gauge and rating breakdown */}
      <View style={tw`h-4`} />

      {/* Rating breakdown legend - shows all tags even if 0% */}
      <View style={tw`flex-row flex-wrap justify-center gap-x-5 gap-y-2.5 px-2`}>
        {allTagsWithStats.map((rating, index) => (
          <View key={index} style={tw`flex-row items-center`}>
            <View
              style={[
                tw`mr-2 h-3 w-3 rounded-full`,
                { backgroundColor: getRatingColor(index) },
              ]}
            />
            <Text style={tw.style(bodySmallRegular, 'text-gray-700')}>
              {rating.tagName} {rating.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecipeRatingCard;
