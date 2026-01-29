const supabase = require('../config/supabase.js');

const register = async (call, callback) => {
  const { email, password } = call.request;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return callback(null, { error: error.message });
  }
  callback(null, { 
    token: data.session?.access_token || "", 
    user_id: data.user?.id || "" 
  });
};

const login = async (call, callback) => {
  const { email, password } = call.request;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return callback(null, { error: error.message });
  }
  callback(null, { 
    token: data.session.access_token, 
    user_id: data.user.id 
  });
};

module.exports = { register, login };