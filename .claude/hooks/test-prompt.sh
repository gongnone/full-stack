#!/bin/bash
# Simple test script that asks for confirmation
echo "This is a test prompt"
echo ""
read -p "Allow this action? (y/n): " answer
echo ""
echo "You answered: $answer"
echo "Test complete!"
