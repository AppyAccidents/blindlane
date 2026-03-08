/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import { EditorPanel } from '@/app/components/EditorPanel';

describe('EditorPanel', () => {
  it('disables generate button when prompt is empty and enables after input', () => {
    const onPromptChange = jest.fn();

    const { rerender } = render(
      <EditorPanel
        prompt=""
        targetPlatform="linkedin"
        onPromptChange={onPromptChange}
        onTargetPlatformChange={jest.fn()}
        onGenerate={jest.fn()}
        isGenerating={false}
        workingDraft={null}
      />
    );

    expect(screen.getByRole('button', { name: 'Generate 6 Drafts' })).toBeDisabled();
    expect(screen.getByText('Winner appears here after convergence.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Write your content prompt...'), {
      target: { value: 'Test prompt' },
    });
    expect(onPromptChange).toHaveBeenCalledWith('Test prompt');

    rerender(
      <EditorPanel
        prompt="Test prompt"
        targetPlatform="linkedin"
        onPromptChange={onPromptChange}
        onTargetPlatformChange={jest.fn()}
        onGenerate={jest.fn()}
        isGenerating={false}
        workingDraft={null}
      />
    );

    expect(screen.getByRole('button', { name: 'Generate 6 Drafts' })).toBeEnabled();
  });
});
