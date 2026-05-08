"""
Supabase client for Python API routes
"""
import os
from supabase import create_client, Client

# Initialize Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise ValueError('Missing Supabase environment variables')

supabase: Client = create_client(supabase_url, supabase_key)

def get_user_usage(user_id: str):
    """Get user's current month usage"""
    from datetime import datetime
    month_key = datetime.now().strftime('%Y-%m')

    try:
        response = supabase.table('usage_tracking').select('*').eq('user_id', user_id).eq('month_key', month_key).execute()
        if response.data:
            return response.data[0]
        else:
            # Create new usage record
            response = supabase.table('usage_tracking').insert({
                'user_id': user_id,
                'month_key': month_key,
                'analyses_count': 0
            }).execute()
            return response.data[0]
    except Exception as e:
        print(f"Error getting user usage: {e}")
        return None

def increment_usage(user_id: str):
    """Increment user's analysis count for current month"""
    from datetime import datetime
    month_key = datetime.now().strftime('%Y-%m')

    try:
        # Use RPC function if available, otherwise manual update
        response = supabase.rpc('increment_usage_count', {
            'p_user_id': user_id,
            'p_month_key': month_key
        }).execute()
        return response.data
    except Exception:
        # Fallback: get current, increment, update
        current = get_user_usage(user_id)
        if current:
            new_count = current['analyses_count'] + 1
            response = supabase.table('usage_tracking').update({
                'analyses_count': new_count,
                'last_analysis_at': 'now()'
            }).eq('id', current['id']).execute()
            return response.data[0]
        return None

def save_analysis(user_id: str, analysis_data: dict):
    """Save analysis result to history"""
    try:
        data = {
            'user_id': user_id,
            **analysis_data
        }
        response = supabase.table('analysis_history').insert(data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error saving analysis: {e}")
        return None