#!/usr/bin/env node

/**
 * JWT Secret Generator
 * Generates a cryptographically secure JWT secret for production use
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateJWTSecret() {
    console.log('🔑 JWT Secret Generator');
    console.log('========================\n');
    
    // Generate primary JWT secret (256-bit)
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    
    // Generate refresh token secret (256-bit)
    const refreshSecret = crypto.randomBytes(32).toString('hex');
    
    // Display results
    console.log('✅ Generated Secrets:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('JWT_SECRET:');
    console.log(jwtSecret);
    console.log('\nREFRESH_TOKEN_SECRET:');
    console.log(refreshSecret);
    
    console.log('\n📊 Security Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`JWT Secret Length: ${jwtSecret.length} characters`);
    console.log(`Refresh Secret Length: ${refreshSecret.length} characters`);
    console.log('Entropy: 256 bits each');
    console.log('Algorithm: Cryptographically secure random bytes');
    
    console.log('\n🚀 Deployment Commands:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('# Set JWT secret for production:');
    console.log('wrangler secret put JWT_SECRET --env production');
    console.log('\n# Set refresh token secret:');
    console.log('wrangler secret put REFRESH_TOKEN_SECRET --env production');
    console.log('\n# Verify secrets are set:');
    console.log('wrangler secret list --env production');
    
    // Create .env.local file for development
    const envContent = `# Generated JWT Secrets for Development
# DO NOT COMMIT THIS FILE TO VERSION CONTROL
# Generated on: ${new Date().toISOString()}

# JWT Configuration
JWT_SECRET=${jwtSecret}
REFRESH_TOKEN_SECRET=${refreshSecret}
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Environment
ENVIRONMENT=development
`;
    
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        fs.writeFileSync(envPath, envContent);
        console.log('\n📝 Created .env.local file for development');
        console.log('   (Remember to add .env.local to .gitignore)');
    } catch (error) {
        console.log('\n⚠️  Could not create .env.local file:', error.message);
    }
    
    console.log('\n🔒 Security Reminders:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('• Store these secrets securely in a password manager');
    console.log('• Use different secrets for dev, staging, and production');
    console.log('• Never commit secrets to version control');
    console.log('• Rotate secrets quarterly');
    console.log('• Monitor for "default JWT secret" warnings in production');
    
    return {
        jwtSecret,
        refreshSecret
    };
}

// Export for programmatic use
if (require.main === module) {
    generateJWTSecret();
} else {
    module.exports = generateJWTSecret;
}