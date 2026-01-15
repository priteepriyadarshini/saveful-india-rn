import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import tw from '../../../common/tailwind';
import {
  bodySmallRegular,
  h7TextStyle,
} from '../../../theme/typography';
import {
  recipeRatingApiService,
  RecipeRatingStats,
} from '../../recipeRating/api/recipeRatingApiService';

interface RecipeRatingCardProps {
  recipeId: string;
  maxHeight?: number;
  setMaxHeight?: (height: number) => void;
}

// Carrot Icon Component
const CarrotIcon = ({ size = 20, filled = false }: { size?: number; filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
      <Path fill={filled ? '#77B255' : '#D1D5DB'} d="M31.096 8.933c3.535-2.122 4.408-8.32 3.701-7.613c.707-.707-5.657 0-7.778 3.536c0-1.414-1.414-7.071-3.535-2.121c-2.122 4.95-1.415 5.657-1.415 7.071c0 1.414 2.829 1.414 2.829 1.414s-.125 2.704 1.29 2.704c1.414 0 1.997.583 6.946-1.538c4.95-2.122-.624-3.453-2.038-3.453z" />
      <Path fill={filled ? '#F4900C' : '#D1D5DB'} d="M22.422 23.594C14.807 31.209 2.27 36.675.502 34.907c-1.768-1.768 3.699-14.305 11.313-21.92c7.615-7.615 11.53-7.562 14.85-4.243c3.319 3.32 3.372 7.235-4.243 14.85z" />
      <Path fill={filled ? '#D67503' : '#9CA3AF'} d="M21.875 14.56c-.972-.972-2.77-2.785-4.692-6.106a25.419 25.419 0 0 0-2.409 1.808c2.803 3.613 8.121 5.317 7.101 4.298zm-7.485 8.072c-1.041-1.041-3.03-3.05-5.105-6.846a48.86 48.86 0 0 0-1.98 2.57c2.807 3.597 8.101 5.292 7.085 4.276zm9.301-.351c-3.581-2.008-5.49-3.91-6.502-4.921c-1.02-1.022.692 4.315 4.317 7.114a94.795 94.795 0 0 0 2.185-2.193zm-12.183 9.324a54.359 54.359 0 0 0 2.715-1.597c-3.273-1.905-5.069-3.683-6.034-4.648c-.922-.923.386 3.347 3.319 6.245z" />
    </Svg>
);

const RecipeRatingCard: React.FC<RecipeRatingCardProps> = ({
  recipeId,
  maxHeight = 0,
  setMaxHeight,
}) => {
  const [stats, setStats] = useState<RecipeRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setIsLoading(true);
        const ratingStats = await recipeRatingApiService.getRecipeRatingStats(recipeId);
        setStats(ratingStats);
      } catch (error) {
        console.error('[RecipeRatingCard] Error fetching rating data:', error);
        setStats(null);
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
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  }

  const hasRatings = stats && stats.totalRatings > 0;
  const averageRating = stats?.averageRating || 0;

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
      {/* Header */}
      <Text style={tw.style(h7TextStyle, 'text-center text-eggplant pb-3')}>
        RECIPE RATING
      </Text>
      
      {hasRatings ? (
        <>
          {/* Average Rating Display */}
          <View style={tw`items-center justify-center pb-5 pt-2`}>
            <View style={tw`flex-row items-center gap-2 pb-3`}>
              {[1, 2, 3, 4, 5].map((rating) => {
                const isFilled = rating <= Math.round(averageRating);
                return <CarrotIcon key={rating} size={28} filled={isFilled} />;
              })}
            </View>
            <Text style={tw.style('font-sans-bold text-4xl text-carrot pb-1')}>
              {averageRating.toFixed(1)}
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
            </Text>
          </View>

          {/* Divider */}
          <View style={tw`border-t border-strokecream mb-4`} />

          {/* Rating Distribution */}
          <View style={tw`gap-2.5`}>
            {stats.ratingDistribution
              .sort((a, b) => b.rating - a.rating)
              .map((dist) => {
                const widthPercentage = Math.max(dist.percentage, 0);
                return (
                  <View key={dist.rating} style={tw`flex-row items-center gap-2.5`}>
                    <View style={tw`flex-row items-center gap-1 w-10`}>
                      <Text style={tw.style(bodySmallRegular, 'font-sans-bold text-eggplant')}>
                        {dist.rating}
                      </Text>
                      <CarrotIcon size={14} filled={true} />
                    </View>

                    {/* Progress Bar Container */}
                    <View style={tw`flex-1`}>
                      <View style={tw`h-2 bg-strokecream rounded-full overflow-hidden`}>
                        <View
                          style={{
                            height: '100%',
                            width: `${widthPercentage}%`,
                            backgroundColor: '#FF6B35',
                            borderRadius: 9999,
                          }}
                        />
                      </View>
                    </View>

                    {/* Count */}
                    <Text style={tw.style(bodySmallRegular, 'text-midgray w-8 text-right')}>
                      {dist.count}
                    </Text>
                  </View>
                );
              })}
          </View>
        </>
      ) : (
        <View style={tw`items-center justify-center py-8`}>
          <View style={tw`pb-3`}>
            <CarrotIcon size={48} filled={false} />
          </View>
          <Text style={tw.style(bodySmallRegular, 'text-center text-midgray')}>
            No ratings yet.{'\n'}Be the first to rate!
          </Text>
        </View>
      )}
    </View>
  );
};

export default RecipeRatingCard;
